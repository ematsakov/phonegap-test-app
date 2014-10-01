(function( $ ) {

  var endPoint = 'sss-rest-api';
  var pathUrl = 'http://dev-start-school-smart.gotpantheon.com';
  //var pathUrl = 'http://drupal7.dev/start-school-smart';

  window.SSS = {
    init: function() {
      this.processApiUrls();
      this.checkUserAuthentication();
      this.login();
      this.logout();
      this.ajaxLink();
    },

    processApiUrls: function() {
      $('[rel="api-url"]').each(function() {
        //link
        if($(this).attr('href')){
          var href = pathUrl + $(this).attr('href');
          $(this).attr('href', href);
        }

        //form
        if($(this).attr('action')){
          var action = pathUrl + $(this).attr('action');
          $(this).attr('action', action);
        }
      });
    },

    checkUserAuthentication: function() {
      $.ajax({
        url:pathUrl + "/services/session/token",
        type:"get",
        dataType:"text",
        crossDomain: true,
        error:function (jqXHR, textStatus, errorThrown) {
          alert(errorThrown);
        },
        success: function (token) {
          if(token == $.cookie('X-CSRF-Token')){
          //logged
            $('#form-login').hide();
          }
          else{
            $.cookie('X-CSRF-Token', null);
            $('.content').hide();
          }
        }
      });
    },

    login: function() {
      $('#form-login').submit(function(e) {
        var form = $(this);
        var postData = form.serializeArray();
        var formURL = form.attr("action");
        $.ajax({
          url : formURL,
          type: "POST",
          data : postData,
          crossDomain: true,
          success:function(data, textStatus, jqXHR) {
            sessName = data.session_name;
            sessId = data.sessid;
            $.cookie(sessName, sessId);

            // Obtain session token.
            $.ajax({
             url:pathUrl + "/services/session/token",
             type:"get",
             dataType:"text",
             crossDomain: true,
             error:function (jqXHR, textStatus, errorThrown) {
               alert(errorThrown);
             },
             success: function (token) {
               // Call system connect with session token.
               $.ajax({
                 url: pathUrl + "/" + endPoint + "/system/connect.json",
                 type: "post",
                 dataType: "json",
                 crossDomain: true,
                 beforeSend: function (request) {
                   request.setRequestHeader("X-CSRF-Token", token);
                   $.cookie('X-CSRF-Token', token, { expires: 365 });
                 },
                 error: function (jqXHR, textStatus, errorThrown) {
                   alert(errorThrown);
                 },
                 success: function (data) {
                   alert('Hello user #' + data.user.uid);
                   form.hide();
                   $('.content').show();
                 }
               });
             }
            });
          },
          error: function(jqXHR, textStatus, errorThrown) {
            alert(jqXHR.statusText);
          }
        });
        e.preventDefault(); //STOP default action
      });
    },

    logout: function() {
      $('#form-logout').submit(function(e) {
        var form = $(this);
        var formURL = form.attr("action");
        $.ajax({
          url:pathUrl + "/services/session/token",
          type:"get",
          dataType:"text",
          crossDomain: true,
          error:function (jqXHR, textStatus, errorThrown) {
           alert(errorThrown);
          },
          success: function (token) {
            $.ajax({
              url : formURL,
              type: "POST",
              crossDomain: true,
              beforeSend: function (request) {
                request.setRequestHeader("X-CSRF-Token", token);
              },
              success:function(data, textStatus, jqXHR){
                $.cookie('X-CSRF-Token', null);
                $('.content textarea').val('');
                $('.content').hide();
                $('#form-login').show();
              },
            });
          }
        });
        e.preventDefault(); //STOP default action
      });
    },

    ajaxLink: function() {
      $('.ajax').click(function(e){
        e.preventDefault(); //STOP default action
        var link = $(this);
        var url = link.attr('href');
        $.ajax({
          url : url,
          type: "GET",
          crossDomain: true,
          success:function(data, textStatus, jqXHR){
            link.next().find('textarea').val(JSON.stringify(data));
          },
        });

      });
    }
  }

  jQuery( document ).ready(function( $ ) {
    SSS.init();
  });

})( jQuery );
