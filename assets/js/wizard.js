
var Wizard = (function($){

    var t;

    // callbacks from form button clicks.
    var callbacks = {
        install_child: function(btn) {
            var installer = new ChildTheme();
            installer.init(btn);
        },
        activate_license: function(btn) {
            var license = new ActivateLicense();
            license.init(btn);
        },
        install_plugins: function(btn){
            var plugins = new PluginManager();
            plugins.init(btn);
        },
        install_content: function(btn){
            var content = new ContentManager();
            content.init(btn);
        }
    };

    function window_loaded(){

    	var
    	body 		= $('.wizard__body'),
    	body_loading 	= $('.wizard__body--loading'),
    	body_exiting 	= $('.wizard__body--exiting'),
    	drawer_trigger 	= $('#wizard__drawer-trigger'),
    	drawer_opening 	= 'wizard__drawer--opening';
    	drawer_opened 	= 'wizard__drawer--open';

    	setTimeout(function(){
	        body.addClass('loaded');
	    },100);

    	drawer_trigger.on('click', function(){
        	body.toggleClass( drawer_opened );
        });

    	$('.wizard__button--proceed:not(.wizard__button--closer)').click(function (e) {
		    e.preventDefault();
		    var goTo = this.getAttribute("href");

		    body.addClass('exiting');

		    setTimeout(function(){
		        window.location = goTo;
		    },400);
		});

        $(".wizard__button--closer").on('click', function(e){

        	body.removeClass( drawer_opened );

            e.preventDefault();
		    var goTo = this.getAttribute("href");

		    setTimeout(function(){
		        body.addClass('exiting');
		    },600);

		    setTimeout(function(){
		        window.location = goTo;
		    },1100);
        });

        $(".button-next").on( "click", function(e) {
            e.preventDefault();
            var loading_button = wizard_loading_button(this);
            if ( ! loading_button ) {
                return false;
            }
            var data_callback = $(this).data("callback");
            if( data_callback && typeof callbacks[data_callback] !== "undefined"){
                // We have to process a callback before continue with form submission.
                callbacks[data_callback](this);
                return false;
            } else {
                return true;
            }
        });

				$( document ).on( 'change', '.js-wizard-demo-import-select', function() {
					var selectedIndex  = $( this ).val();

					$( '.js-wizard-select-spinner' ).show();

					$.post( wizard_params.ajaxurl, {
						action: 'wizard_update_selected_import_data_info',
						wpnonce: wizard_params.wpnonce,
						selected_index: selectedIndex,
					}, function( response ) {
						if ( response.success ) {
							$( '.js-wizard-drawer-import-content' ).html( response.data );
						}
						else {
							alert( wizard_params.texts.something_went_wrong );
						}

						$( '.js-wizard-select-spinner' ).hide();
					} )
						.fail( function() {
							$( '.js-wizard-select-spinner' ).hide();
							alert( wizard_params.texts.something_went_wrong )
						} );
				} );
    }

    function ChildTheme() {
    	var body 				= $('.wizard__body');
        var complete, notice 	= $("#child-theme-text");

        function ajax_callback(r) {

            if (typeof r.done !== "undefined") {
            	setTimeout(function(){
			        notice.addClass("lead");
			    },0);
			    setTimeout(function(){
			        notice.addClass("success");
			        notice.html(r.message);
			    },600);


                complete();
            } else {
                notice.addClass("lead error");
                notice.html(r.error);
            }
        }

        function do_ajax() {
            jQuery.post(wizard_params.ajaxurl, {
                action: "wizard_child_theme",
                wpnonce: wizard_params.wpnonce,
            }, ajax_callback).fail(ajax_callback);
        }

        return {
            init: function(btn) {
                complete = function() {

                	setTimeout(function(){
				$(".wizard__body").addClass('js--finished');
			},1500);

                	body.removeClass( drawer_opened );

                	setTimeout(function(){
				$('.wizard__body').addClass('exiting');
			},3500);

                    	setTimeout(function(){
				window.location.href=btn.href;
			},4000);

                };
                do_ajax();
            }
        }
    }










function ActivateLicense() {
    	var body 		= $( '.wizard__body' );
    	var wrapper 		= $( '.wizard__content--license-key' );
        var complete, notice 	= $( '#license-text' );

        function ajax_callback(r) {

            if (typeof r.success !== "undefined" && r.success) {
              notice.siblings( '.error-message' ).remove();
            	setTimeout(function(){
			        notice.addClass("lead");
			    },0);
			    setTimeout(function(){
			        notice.addClass("success");
			        notice.html(r.message);
			    },600);
                complete();
            } else {
                $( '.js-wizard-license-activate-button' ).removeClass( 'wizard__button--loading' ).data( 'done-loading', 'no' );
                notice.siblings( '.error-message' ).remove();
                wrapper.addClass('has-error');
                notice.html(r.message);
                notice.siblings( '.error-message' ).addClass("lead error");
            }
        }


        function do_ajax() {

        	wrapper.removeClass('has-error');

            jQuery.post(wizard_params.ajaxurl, {
              action: "wizard_activate_license",
              wpnonce: wizard_params.wpnonce,
              license_key: $( '.js-license-key' ).val()
            }, ajax_callback).fail(ajax_callback);


        }

        return {
            init: function(btn) {
                complete = function() {
                	setTimeout(function(){
				$(".wizard__body").addClass('js--finished');
			},1500);

                	body.removeClass( drawer_opened );

                	setTimeout(function(){
				$('.wizard__body').addClass('exiting');
			},3500);

                    	setTimeout(function(){
				window.location.href=btn.href;
			},4000);

                };
                do_ajax();
            }
        }
    }

function PluginManager(){

    	var body = $('.wizard__body');
        var complete;
        var items_completed 	= 0;
        var current_item 		= "";
        var $current_node;
        var current_item_hash 	= "";

        function ajax_callback(response){
            var currentSpan = $current_node.find("label");
            if(typeof response === "object" && typeof response.message !== "undefined"){
                currentSpan.removeClass( 'installing success error' ).addClass(response.message.toLowerCase());

                // The plugin is done (installed, updated and activated).
                if(typeof response.done != "undefined" && response.done){
                    find_next();
                }else if(typeof response.url != "undefined"){
                    // we have an ajax url action to perform.
                    if(response.hash == current_item_hash){
                        currentSpan.removeClass( 'installing success' ).addClass("error");
                        find_next();
                    }else {
                        current_item_hash = response.hash;
                        jQuery.post(response.url, response, ajax_callback).fail(ajax_callback);
                    }
                }else{
                    // error processing this plugin
                    find_next();
                }
            }else{
                // The TGMPA returns a whole page as response, so check, if this plugin is done.
                process_current();
            }
        }

        function process_current(){
            if(current_item){
                var $check = $current_node.find("input:checkbox");
                if($check.is(":checked")) {
                    jQuery.post(wizard_params.ajaxurl, {
                        action: "wizard_plugins",
                        wpnonce: wizard_params.wpnonce,
                        slug: current_item,
                    }, ajax_callback).fail(ajax_callback);
                }else{
                    $current_node.addClass("skipping");
                    setTimeout(find_next,300);
                }
            }
        }

        function find_next(){
            if($current_node){
                if(!$current_node.data("done_item")){
                    items_completed++;
                    $current_node.data("done_item",1);
                }
                $current_node.find(".spinner").css("visibility","hidden");
            }
            var $li = $(".wizard__drawer--install-plugins li");
            $li.each(function(){
                var $item = $(this);

                if ( $item.data("done_item") ) {
                    return true;
                }

                current_item = $item.data("slug");
                $current_node = $item;
                process_current();
                return false;
            });
            if(items_completed >= $li.length){
                // finished all plugins!
                complete();
            }
        }

        return {
            init: function(btn){
                $(".wizard__drawer--install-plugins").addClass("installing");
                $(".wizard__drawer--install-plugins").find("input").prop("disabled", true);
                complete = function(){

                	setTimeout(function(){
				        $(".wizard__body").addClass('js--finished');
				    },1000);

                	body.removeClass( drawer_opened );

                	setTimeout(function(){
				        $('.wizard__body').addClass('exiting');
				    },3000);

                    setTimeout(function(){
				        window.location.href=btn.href;
				    },3500);

                };
                find_next();
            }
        }
    }
    function ContentManager(){

    	var body 				= $('.wizard__body');
        var complete;
        var items_completed 	= 0;
        var current_item 		= "";
        var $current_node;
        var current_item_hash 	= "";
        var current_content_import_items = 1;
        var total_content_import_items = 0;
        var progress_bar_interval;

        function ajax_callback(response) {
            var currentSpan = $current_node.find("label");
            if(typeof response == "object" && typeof response.message !== "undefined"){
                currentSpan.addClass(response.message.toLowerCase());

                if( typeof response.num_of_imported_posts !== "undefined" && 0 < total_content_import_items ) {
                    current_content_import_items = 'all' === response.num_of_imported_posts ? total_content_import_items : response.num_of_imported_posts;
                    update_progress_bar();
                }

                if(typeof response.url !== "undefined"){
                    // we have an ajax url action to perform.
                    if(response.hash === current_item_hash){
                        currentSpan.addClass("status--failed");
                        find_next();
                    }else {
                        current_item_hash = response.hash;

                        // Fix the undefined selected_index issue on new AJAX calls.
                        if ( typeof response.selected_index === "undefined" ) {
                            response.selected_index = $( '.js-wizard-demo-import-select' ).val() || 0;
                        }

                        jQuery.post(response.url, response, ajax_callback).fail(ajax_callback); // recuurrssionnnnn
                    }
                }else if(typeof response.done !== "undefined"){
                    // finished processing this plugin, move onto next
                    find_next();
                }else{
                    // error processing this plugin
                    find_next();
                }
            }else{
                console.log(response);
                // error - try again with next plugin
                currentSpan.addClass("status--error");
                find_next();
            }
        }

        function process_current(){
            if(current_item){
                var $check = $current_node.find("input:checkbox");
                if($check.is(":checked")) {
                    jQuery.post(wizard_params.ajaxurl, {
                        action: "wizard_content",
                        wpnonce: wizard_params.wpnonce,
                        content: current_item,
                        selected_index: $( '.js-wizard-demo-import-select' ).val() || 0
                    }, ajax_callback).fail(ajax_callback);
                }else{
                    $current_node.addClass("skipping");
                    setTimeout(find_next,300);
                }
            }
        }

        function find_next(){
            var do_next = false;
            if($current_node){
                if(!$current_node.data("done_item")){
                    items_completed++;
                    $current_node.data("done_item",1);
                }
                $current_node.find(".spinner").css("visibility","hidden");
            }
            var $items = $(".wizard__drawer--import-content__list-item");
            var $enabled_items = $(".wizard__drawer--import-content__list-item input:checked");
            $items.each(function(){
                if (current_item == "" || do_next) {
                    current_item = $(this).data("content");
                    $current_node = $(this);
                    process_current();
                    do_next = false;
                } else if ($(this).data("content") == current_item) {
                    do_next = true;
                }
            });
            if(items_completed >= $items.length){
                complete();
            }
        }

        function init_content_import_progress_bar() {
            if( ! $(".wizard__drawer--import-content__list-item .checkbox-content").is( ':checked' ) ) {
                return false;
            }

            jQuery.post(wizard_params.ajaxurl, {
                action: "wizard_get_total_content_import_items",
                wpnonce: wizard_params.wpnonce,
                selected_index: $( '.js-wizard-demo-import-select' ).val() || 0
            }, function( response ) {
                total_content_import_items = response.data;

                if ( 0 < total_content_import_items ) {
                    update_progress_bar();

                    // Change the value of the progress bar constantly for a small amount (0,2% per sec), to improve UX.
                    progress_bar_interval = setInterval( function() {
                        current_content_import_items = current_content_import_items + total_content_import_items/500;
                        update_progress_bar();
                    }, 1000 );
                }
            } );
        }

        function valBetween(v, min, max) {
            return (Math.min(max, Math.max(min, v)));
        }

        function update_progress_bar() {
            $('.js-wizard-progress-bar').css( 'width', (current_content_import_items/total_content_import_items) * 100 + '%' );

            var $percentage = valBetween( ((current_content_import_items/total_content_import_items) * 100) , 0, 99);

            $('.js-wizard-progress-bar-percentage').html( Math.round( $percentage ) + '%' );

            if ( 1 === current_content_import_items/total_content_import_items ) {
                clearInterval( progress_bar_interval );
            }
        }

        return {
            init: function(btn){
                $(".wizard__drawer--import-content").addClass("installing");
                $(".wizard__drawer--import-content").find("input").prop("disabled", true);
                complete = function(){

			$.post(wizard_params.ajaxurl, {
				action: "wizard_import_finished",
				wpnonce: wizard_params.wpnonce,
				selected_index: $( '.js-wizard-demo-import-select' ).val() || 0
			});

			setTimeout(function(){
				$('.js-wizard-progress-bar-percentage').html( '100%' );
			},100);

                	setTimeout(function(){
				       body.removeClass( drawer_opened );
				    },500);

                	setTimeout(function(){
				        $(".wizard__body").addClass('js--finished');
				    },1500);

                	setTimeout(function(){
				        $('.wizard__body').addClass('exiting');
				    },3400);

                    setTimeout(function(){
				        window.location.href=btn.href;
				    },4000);
                };
                init_content_import_progress_bar();
                find_next();
            }
        }
    }

    function wizard_loading_button( btn ){

        var $button = jQuery(btn);

        if ( $button.data( "done-loading" ) == "yes" ) {
        	return false;
        }

        var completed = false;

        var _modifier = $button.is("input") || $button.is("button") ? "val" : "text";

        $button.data("done-loading","yes");

        $button.addClass("wizard__button--loading");

        return {
            done: function(){
                completed = true;
                $button.attr("disabled",false);
            }
        }

    }

    return {
        init: function(){
            t = this;
            $(window_loaded);
        },
        callback: function(func){
            console.log(func);
            console.log(this);
        }
    }

})(jQuery);

Wizard.init();
