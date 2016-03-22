$(function () {
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
    $('#myImg').hide();
    $(":file").change(function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = imageIsLoaded;
            reader.readAsDataURL(this.files[0]);
        }
    });
    $("#link").change(function() {
      if($('#link').val() == "") {
        $('#myImg').hide();
        $('#file').removeClass('btn-success').addClass('btn-warning');
      } else {
        $('#myImg').attr("src", $('#link').val());
        $('#file').removeClass('btn-warning').addClass('btn-success').width($('#myImg').width());
        $('#myImg').show();
      }
    });
});

function imageIsLoaded(e) {
    $('#myImg').attr('src', e.target.result);
    $('#file').removeClass('btn-warning').addClass('btn-success').width($('#myImg').width());
    $('#myImg').show();
}