var cached_configs = {};
var spreadsheet_scope = 'https://spreadsheets.google.com/feeds';

function default_config(config) {
    config = config || {
							email: null,
							key_file: null,
							token: {
								type: 'Bearer'
							},
							scopes: [spreadsheet_scope]
						};
	
	var cached_configs = config;
	
	return config;
}

module.exports = default_config;