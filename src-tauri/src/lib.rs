use std::io::{Read, Write};
use std::net::TcpListener;
use tauri::{AppHandle, Emitter, Manager};

/// Starts a local HTTP server on port 8765 to catch the Spotify OAuth callback.
/// Emits `spotify-oauth-code` event with the authorization code when received.
#[tauri::command]
async fn start_spotify_oauth(app: AppHandle) -> Result<u16, String> {
    let port: u16 = 8765;
    let listener = TcpListener::bind(format!("127.0.0.1:{}", port))
        .map_err(|e| format!("Port {} already in use: {}", port, e))?;

    std::thread::spawn(move || {
        match listener.accept() {
            Ok((mut stream, _)) => {
                let mut buf = vec![0u8; 8192];
                let n = stream.read(&mut buf).unwrap_or(0);
                let request = String::from_utf8_lossy(&buf[..n]).to_string();

                let first_line = request.lines().next().unwrap_or("");
                let path = first_line.split_whitespace().nth(1).unwrap_or("");

                let query = path.splitn(2, '?').nth(1).unwrap_or("");
                let code = query.split('&').find_map(|pair| {
                    let mut parts = pair.splitn(2, '=');
                    let key = parts.next()?;
                    let val = parts.next()?;
                    if key == "code" { Some(val.to_string()) } else { None }
                });

                let (html_body, event_ok) = if let Some(ref c) = code {
                    (
                        format!(
                            "<!DOCTYPE html><html lang='pt-BR'><head><meta charset='utf-8'><title>Flowspace</title>\
                            <style>*{{margin:0;padding:0;box-sizing:border-box}}\
                            body{{font-family:system-ui,sans-serif;background:#0a0a0a;color:#eee;\
                            display:flex;align-items:center;justify-content:center;height:100vh;\
                            flex-direction:column;gap:16px}}\
                            .check{{font-size:64px}}h2{{font-size:1.5rem;font-weight:700}}\
                            p{{color:#888}}</style></head><body>\
                            <div class='check'>✅</div><h2>Conectado!</h2>\
                            <p>Pode fechar esta janela.</p></body></html>"
                        ),
                        Some(c.clone()),
                    )
                } else {
                    (
                        "<!DOCTYPE html><html><body style='font-family:system-ui;background:#0a0a0a;color:#eee;display:flex;align-items:center;justify-content:center;height:100vh'>❌ Autorização falhou.</body></html>".to_string(),
                        None,
                    )
                };

                let response = format!(
                    "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
                    html_body.len(),
                    html_body
                );
                let _ = stream.write_all(response.as_bytes());
                drop(stream);

                if let Some(code_val) = event_ok {
                    let _ = app.emit("spotify-oauth-code", code_val);
                } else {
                    let _ = app.emit("spotify-oauth-error", "No authorization code received");
                }
            }
            Err(e) => {
                let _ = app.emit("spotify-oauth-error", e.to_string());
            }
        }
    });

    Ok(port)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![start_spotify_oauth])
        .run(tauri::generate_context!())
        .expect("error while running Flowspace");
}
