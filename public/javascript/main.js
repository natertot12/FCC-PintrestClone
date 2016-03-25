$(document).ready(function() {
   var $mason=$('#masonry');
   $mason.hide();
   $('#spinner').hide();
   $('#bottom-spinner').hide();
   
  /* var $grid = $('.grid').masonry({
       itemSelector: '.grid-item',
       percentPosition: true,
       columnWidth: 50
    });*/
    
    var $grid = $('.grid').masonry({
      columnWidth: 40,
      itemSelector: '.grid-item'
    });

    $grid.imagesLoaded().progress( function() {
        $grid.masonry();
        $mason.show();
        $('#spinner').hide();
    });
    
    var ready = true;
    $(window).scroll(function() {   
        if($(window).scrollTop() + $(window).height() == $(document).height()) {
            var count = $("#masonry").find('img').size();
            if(count >= 10 && ready) {
                ready = false;
                $('#bottom-spinner').show();
                $.get('/appendItems/' + (count).toString(), function(content) {
                    var $el = $(content);
                    $el.imagesLoaded(function(){
                        $('#bottom-spinner').hide();
                        $grid.append($el).masonry('appended', $el, 'reloadItems');
                        
                        ready = true;
                    });
                });
            }
        }
    });

    
    
    
    
    /*$('.append-button').on( 'click', function() {
        $.get('/appendItems/' + (0).toString(), function(content) {
            var $el = $(content);
            $grid.imagesLoaded(function(){
              $grid.append($el).masonry('appended', $el, 'reloadItems');
            });
        });
    });*/
});