$(document).ready(function() {
    
    
   var $mason=$('#masonry');
   $mason.hide();
   
   
   var $grid = $('.grid').masonry({
       itemSelector: '.grid-item',
       percentPosition: true,
       columnWidth: 50
    });
    
    
    $grid.imagesLoaded().progress( function() {
        $grid.masonry();
        $mason.show();
    });
    
    
});