$(function () {
      $('#description').keypress(function(){
      if(this.value.length > 140) return false;
      $("#textCount").html((140 - this.value.length) + " Characters Left");
    });
});