mod campaigns;
mod character;
mod rules;
mod server;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|_app| {
            tauri::async_runtime::spawn(async {
                if let Err(error) = server::run().await {
                    eprintln!("Erreur du serveur HTTP : {error}");
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            campaigns::list_campaigns,
            campaigns::create_campaign,
            campaigns::get_campaign,
            character::create_character,
            character::list_characters,
            character::get_character,
            character::update_character,
            character::delete_character,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
