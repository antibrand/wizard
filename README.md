# wizard

![cover image](https://raw.githubusercontent.com/antibrand/wizard/master/cover.jpg)

Setup and install wizard for your web products.

## Usage

### 1. Add to a theme

First, [download the latest release](https://github.com/antibrand/wizard/releases) from the repository.  Next, add all of the files within the release into the theme.

Now all you need to do is require the `class-wizard.php` class, `wizard-config.php` and the composer autoload files in the `functions.php`, like this:

```php
require_once get_parent_theme_file_path( '/inc/wizard/vendor/autoload.php' );
require_once get_parent_theme_file_path( '/inc/wizard/class-wizard.php' );
require_once get_parent_theme_file_path( '/inc/wizard-config.php' );
```

In the example above, the `/wizard/` directory and the `wizard-config.php` file are both placed within the theme's `/inc/` directory location. Also, if you have TGMPA included within your theme, ensure the wizard is included after it.

### 2. Configure

The `wizard-config.php` file tells the wizard where the class is installed.

The config file also let's you modify any of the text strings.

* `directory` — The location in your theme where the wizard code directory is placed (example: `inc/wizard`, if you placed the `wizard` folder in your theme's `inc` folder)
* `wizard_url` — The admin url slug where the wizard will exist
* `child_action_btn_url` — The url for the child theme generator's "Learn more" link
* `dev_mode` — Retain the "Theme Setup" menu item under the Admin > Appearance section for testing

### 3. Define your demo content import files

You'll need the following files:

* `content.xml` — Exported demo content using the export tool
* `widgets.wie` — Exported widgets using the Widget Importer & Exporter plugin
* `customizer.dat` — Exported Customizer settings using the Customizer Export/Import plugin

Once you have those files, you can upload them to your server (recommeded), or include them somewhere in your theme. Next, define a filter in your theme to let the wizard know where these files are located. Depending on where you placed the import files, you have two ways to define the filter:

1\. If you uploaded the import files to your server, then use this code example and edit it, to suit your file locations:

```php
function wizard_import_files() {
    return [
        [
            'import_file_name'           => 'Demo Import',
            'import_file_url'            => 'http://www.your_domain.com/wizard/demo-content.xml',
            'import_widget_file_url'     => 'http://www.your_domain.com/wizard/widgets.json',
            'import_customizer_file_url' => 'http://www.your_domain.com/wizard/customizer.dat',
            'import_preview_image_url'   => 'http://www.your_domain.com/wizard/preview_import_image1.jpg',
            'import_notice'              => __( 'A special note for this import.', 'your-textdomain' ),
            'preview_url'                => 'http://www.your_domain.com/my-demo-1',
        ],
    ];
}
add_filter( 'wizard_import_files', 'wizard_import_files' );
```

2\. If you included the import files somewhere in the theme, then use this code example:

```php
function wizard_local_import_files() {
    return [
        [
            'import_file_name'             => 'Demo Import',
            'local_import_file'            => get_parent_theme_file_path( '/inc/demo/content.xml' ),
            'local_import_widget_file'     => get_parent_theme_file_path( '/inc/demo/widgets.wie' ),
            'local_import_customizer_file' => get_parent_theme_file_path( '/inc/demo/customizer.dat' ),
            'import_preview_image_url'     => 'http://www.your_domain.com/wizard/preview_import_image1.jpg',
            'import_notice'                => __( 'A special note for this import.', 'your-textdomain' ),
            'preview_url'                  => 'http://www.your_domain.com/my-demo-1',
        ],
    ];
}
add_filter( 'wizard_import_files', 'wizard_local_import_files' );
```

#### Multiple demo imports

If you have multiple demo imports, then just define multiple arrays with appropriate data. For an example of two predefined demo imports, please look at the `wizard-filters-sample.php` file.

### 5. Add filters

Inside the package download exists a `wizard-filters-sample.php` file which includes examples of the different filters you may use to modify the wizard. A primary example would be to use to `wizard_generate_child_functions_php` filter to modify the contents of the generated child theme's `functions.php` file.

You may also need to filter your theme demo's home page, so that the wizard knows which pages to set as the home page once it's done running.

### 6. Debugging/log file

A log file is created in `.../wp-content/uploads/wizard-wp/main.log`. In the log file you will see, where something went wrong.

## Contributors

Please read the CONTRIBUTORS.md file in this repository for credits prior to forking by antibrand.
