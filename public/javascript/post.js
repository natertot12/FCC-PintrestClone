$(function () {
  $('#tooSmall').hide();
  $('#tooBig').hide();
  
      var a = true;
      $('img').error(function(){
        if(a) a = false;
        else {
          $(this).attr('src', '/images/no_image.svg');
          $('#link').val('');
        }
      });
      
      
    $('#tags').keypress(function(){
      if(this.value.length > 20) return false;
      $("#textCount").html(20 - this.value.length);
    });
    $('#title').keypress(function(){
      if(this.value.length > 30) return false;
      $("#titleCount").html(30 - this.value.length);
    });
    $('#description').keypress(function(){
      if(this.value.length > 140) return false;
      $("#descriptionCount").html(140 - this.value.length);
    });
    $('#myImg').hide();
    $(":file").change(function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = isImagesLoaded;
            reader.readAsDataURL(this.files[0]);
        }
    });
    $("#link").change(function() {
      $('#tooSmall').hide();
      $('#tooBig').hide();
      $('#myImg').hide();
      $('#myImg').html('');
      if($('#link').val() == "") {
        $('#myImg').hide();
        $('#file').removeClass('btn-success').addClass('btn-warning');
      } else {
        $('#myImg').attr("src", $('#link').val());
        $('#myImg').imagesLoaded(function() {
          console.log('The image height is: '+$('#myImg').outerHeight() + " The image width is: " + $('#myImg').outerWidth());
          if($('#myImg').outerHeight() < 300 || $('#myImg').outerWidth() < 300) {
            $('#tooSmall').show();
            $('#myImg').attr('src', '/images/no_image.svg');
            $('#myImg').show();
            $('#link').val('');
          } else if($('#myImg').outerHeight() > 1000 || $('#myImg').outerWidth() > 1000) {
            $('#tooBig').show();
            $('#myImg').attr('src', '/images/no_image.svg');
            $('#myImg').show();
            $('#link').val('');
          } else {
            $('#file').removeClass('btn-warning').addClass('btn-success').width($('#myImg').width());
            $('#myImg').show();
          }
          });
      }
    });
});
function isImagesLoaded(e) {
    $('#myImg').attr('src', e.target.result);
    console.log('The image height is: '+$('#myImg').outerHeight() + " The image width is: " + $('#myImg').outerWidth());
    if($('#myImg').outerHeight() < 300 || $('#myImg').outerWidth() < 300) {
      $('#tooSmall').show();
      $('#myImg').attr('src', '/images/no_image.svg');
      $('#myImg').show();
      $(':file').val('');
    } else if($('#myImg').outerHeight() > 1000 || $('#myImg').outerWidth() > 1000) {
      $('#tooBig').show();
      $('#myImg').attr('src', '/images/no_image.svg');
      $('#myImg').show();
      $(':file').val('');
    } else {
      $('#file').removeClass('btn-warning').addClass('btn-success').width($('#myImg').width());
      $('#myImg').show();
    }
}