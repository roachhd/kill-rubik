(function($) {
   var xmodal_isopen = false;
   $.fn.xmodalSizeTo = function(duration,width,height,css,callback){
   
      // Automatically determine an appropriate box size
   
      if (width == 0)
         width = $(window).width() - 60;


      if (height == 0)
         height = $(window).height() - 60;
      
      var topV = -Math.round((height+$('#xmodal-modal').outerHeight()-$('#xmodal-body').height())/2);
      var leftV = -Math.round((width+$('#xmodal-modal').outerWidth()-$('#xmodal-body').width())/2);
      
      // Adding these checks in case the width or height are too big
      // Useful for absolute positioning only
      
//      topV = (topV < 50) ? 50:topV;
//      leftV = (leftV < 50) ? 50:leftV;


      $.extend(css,{
         'margin-top':topV,
         'margin-left':leftV,
         'width':'auto',
         'height':'auto'
      });
      var css2 = {
         'width':width,
         'height':height
      };
      return this.each(function(){
         if (duration){
            if (typeof callback == 'function') $(this).animate(css,duration,callback).find('#xmodal-body').animate(css2,duration);
            else $(this).animate(css,duration).find('#xmodal-body').animate(css2,duration);
         }else{
            $(this).css(css).find('#xmodal-body').css(css2);
            if (typeof callback == 'function') callback;
         }
      });
   };
   $.fn.xmodal = function(options) {
      $.fn.xmodal.pre_options = $.fn.xmodal.options;
      $.fn.xmodal.usr_options = options;
      $.fn.xmodal.options = $.extend({},$.fn.xmodal.defaults, options);
      $.fn.xmodal.open();
      return this;
   };
   $.fn.xmodal.open = function(){
      if (xmodal_isopen == true){
         $.fn.xmodal.queue.push($.fn.xmodal.options);
         $.fn.xmodal.options = $.fn.xmodal.pre_options;
         return false;
      }
      xmodal_isopen = true;
      var extra = '';
      var closebtn = '';
      var size = {
         w:$.fn.xmodal.options.width,
         h:$.fn.xmodal.options.height
      };
      if ($.fn.xmodal.options.close){
         closebtn = '<a href="#close" id="xmodal-close"></a>';
      }
      switch ($.fn.xmodal.options.type){
         case 'alert':
            extra = '<div id="xmodal-controls"><a href="#OK" id="xmodal-ok">OK</a></div>';
            size = {w:400,h:200};
            break;
         case 'confirm':
            extra = '<div id="xmodal-controls"><a href="#OK" id="xmodal-ok">OK</a><a href="#Cancel" id="xmodal-cancel">Cancel</a></div>';
            size = {w:500,h:300};
            break;
         case 'prompt':
            extra = '<input id="xmodal-input" type="text" size="32" /><div id="xmodal-controls"><a href="#OK" id="xmodal-ok">OK</a><a href="#Cancel" id="xmodal-cancel">Cancel</a></div>';
            size = {w:200,h:100};
            break;
         case 'image':
            if ($.fn.xmodal.options.image.length){
               extra = '<img src="'+$.fn.xmodal.options.image+'" id="xmodal-image" onload="$(this).addClass(\'modal-needs-resized\')" style="display:none" /><p style="text-align:center;">Loading Image...</p>';
               size = {w:200,h:100};
            }else{
               extra = 'No image.';
               size = {w:200,h:100};
            }
            break;
      }
      if ($.fn.xmodal.usr_options.width != undefined)
         size.w = $.fn.xmodal.usr_options.width;
      if ($.fn.xmodal.usr_options.height != undefined)
         size.h = $.fn.xmodal.usr_options.height;
      $('body').append('<div id="xmodal-container"><div id="xmoda'
       +'l-shade"></div><div id="xmodal-fg"><div id="xmodal-modal"><div id="xmodal-p11"><div id="xmodal-p13"><div id="xmodal-p12"></div></div></div><div id="xmodal-p21"><div id="xmodal-p23"><div id="xmodal-p22"><div id="xmodal-p22b">'+closebtn+'<div id="xmodal-t11"><div id="xmodal-t13"><div id="xmodal-t12"><div i'
       +'d="xmodal-title"><div id="xmodal-title-bg"></div><div id="xmodal-title-fg"></div></div></div></div></div><div id="xmodal-body"></'
       +'div>'+extra+'</div></div></div></div><div id="xmodal-p31"><div id="xmodal-p33"><div id="xmodal-p32"></div></div></div></div></div></div>');
      //var dh = document.body.scrollHeight;
      if ($.fn.xmodal.options.close){
         $('#xmodal-close')
          .click(function(e){
            $.fn.xmodal.close();
            e.preventDefault();
         });
      }
      if ($.fn.xmodal.options.anim){
         $('#xmodal-shade')
          .css({'opacity':0})
          .show()
          .fadeTo(500*$.fn.xmodal.options.speed,0.5,function(){
            $('#xmodal-modal')
             .xmodalSizeTo(0,0,0,{'opacity':0})
             .xmodalSizeTo(500*$.fn.xmodal.options.speed,100,100,{'opacity':1},function(){
               $(this)
                .xmodalSizeTo(200*$.fn.xmodal.options.speed,size.w,size.h,{},function(){
                  $('#xmodal-title div').html($.fn.xmodal.options.title);
                  $('#xmodal-title')
                   .fadeIn(200*$.fn.xmodal.options.speed,function(){
                     $('#xmodal-body')
                      .prepend($.fn.xmodal.options.html)
                      .slideDown(350*$.fn.xmodal.options.speed,function(){
                        $('#xmodal-ok').click(function(e){
                           if (typeof $.fn.xmodal.options.callback == 'function'){
                              if ($.fn.xmodal.options.type == 'prompt'){
                                 $.fn.xmodal.close(function(){
                                    $.fn.xmodal.options.callback($('#xmodal-input').val());
                                 });
                              }else{
                                 $.fn.xmodal.close(function(){
                                    $.fn.xmodal.options.callback(true);
                                 });
                              }
                           }else{
                              $.fn.xmodal.close();
                           }
                           e.preventDefault();
                        });
                        $('#xmodal-cancel').click(function(e){
                           if (typeof $.fn.xmodal.options.callback == 'function'){
                              if ($.fn.xmodal.options.type == 'prompt'){
                                 $.fn.xmodal.close(function(){
                                    $.fn.xmodal.options.callback($('#xmodal-input').val());
                                 });
                              }else{
                                 $.fn.xmodal.close(function(){
                                    $.fn.xmodal.options.callback(false);
                                 });
                              }
                           }else{
                              $.fn.xmodal.close();
                           }
                           e.preventDefault();
                        });
                        if (typeof $.fn.xmodal.options.onload == 'function'){
                           $.fn.xmodal.options.onload();
                        }
                        var img = $('#xmodal-image');
                        if (img.hasClass('modal-needs-resized')){
                           $('#xmodal-modal').xmodalSizeTo(200,img.width()+30,img.height()+30,{});
                           $('#xmodal-body').css('text-align','center').find('p').fadeOut(200,function(){
                              img.fadeIn(200);
                           });
                           img.removeClass('modal-needs-resized');
                        }else{
                           img.each(function(){
                              this.onload = function(){
                                 $('#xmodal-modal').xmodalSizeTo(200,this.width,this.height,{});
                                 $('#xmodal-body').css('text-align','center').find('p').fadeOut(200,function(){
                                    img.fadeIn(200);
                                 });
                                 img.removeClass('modal-needs-resized');
                              }
                           });
                        }
                     });
                  });
               });
            });
         }).click(function(){
            $.fn.xmodal.close();
         });
      }else{
         $('#xmodal-shade').css({'opacity':0.5}).show().click(function(){
            $.fn.xmodal.close();
         });
         $('#xmodal-modal').xmodalSizeTo(0,size.w,size.h,{}).show();
         $('#xmodal-title').html($.fn.xmodal.options.title).show();
         $('#xmodal-body').prepend($.fn.xmodal.options.html).show();
         if (typeof $.fn.xmodal.options.onload == 'function'){
            $.fn.xmodal.options.onload();
         }
         $('#xmodal-ok').click(function(){
            if (typeof $.fn.xmodal.options.callback == 'function'){
               if ($.fn.xmodal.options.type == 'prompt'){
                  $.fn.xmodal.close(function(){
                     $.fn.xmodal.options.callback($('#xmodal-input').val());
                  });
               }else{
                  $.fn.xmodal.close(function(){
                     $.fn.xmodal.options.callback(true);
                  });
               }
            }else{
               $.fn.xmodal.close();
            }
            e.preventDefault();
         });
         $('#xmodal-cancel').click(function(e){
            if (typeof $.fn.xmodal.options.callback == 'function'){
               if ($.fn.xmodal.options.type == 'prompt'){
                  $.fn.xmodal.close(function(){
                     $.fn.xmodal.options.callback($('#xmodal-input').val());
                  });
               }else{
                  $.fn.xmodal.close(function(){
                     $.fn.xmodal.options.callback(false);
                  });
               }
            }else{
               $.fn.xmodal.close();
            }
            e.preventDefault();
         });
      }
   };
   $.fn.xmodal.close = function(callback){
      if (xmodal_isopen){
         if ($.fn.xmodal.options.anim){
            $('#xmodal-body').animate({opacity:0},200*$.fn.xmodal.options.speed,function(){
               $('#xmodal-modal').xmodalSizeTo(500*$.fn.xmodal.options.speed,0,0,{'opacity':0});
               $('#xmodal-shade').fadeOut(500*$.fn.xmodal.options.speed,function(){
                  $('#xmodal-container').remove();
                  xmodal_isopen = false;
                  if (typeof callback == 'function') callback();
                  if ($.fn.xmodal.queue.length){
                     $.fn.xmodal.options = $.fn.xmodal.queue.shift();
                     $.fn.xmodal.open();
                  }
               });
            });
         }else{
            $('#xmodal-container').remove();
            xmodal_isopen = false;
            if (typeof callback == 'function') callback();
            if ($.fn.xmodal.queue.length){
               $.fn.xmodal.options = $.fn.xmodal.queue.shift();
               $.fn.xmodal.open();
            }
         }
      }
   };
   $.fn.xmodal.type = [   // Types of display modals:
      'window',         // Display a window with a close button
      'alert',         // Display an alert with an "OK" button
      'confirm',         // Display a confirm with "OK" and "Cancel" buttons
      'prompt',         // Display a prompt for text input with "OK" and "Cancel" buttons
      'image'            // Display a window with a image resized and centered properly
   ];
   $.fn.xmodal.defaults = {            // Default settings:
      title   :   null,               // Title of modal
      html   :   null,               // Content of modal
      type   :   $.fn.xmodal.type[0],   // Type of modal
      width   :   800,               // Width of modal
      height   :   600,               // Height of modal
      speed   :   1,                  // Speed multiplier of modal animation
      anim   :   true,               // Enable modal animation
      close   :   true,               // Show a close button on modal
      image   :   ''                  // Image URI if type is 'image'
   };
   $.fn.xmodal.options = $.fn.xmodal.defaults;
   $.fn.xmodal.queue = [];
})(jQuery);
