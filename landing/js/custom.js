$(function() {
    $("#accordion").accordion({
        collapsible: true
    });
    $("#accordion h4").click(function() {
        $(this).find('i').toggleClass('fa-minus');
        $(this).find('i').toggleClass('fa-plus');
    });

    particlesJS.load('particles-js', 'js/particlesjs-config.json', function() {
        console.log('callback - particles.js config loaded');
    });

    $('.hero-slider').owlCarousel({
            items:1,
            loop:true,
            margin:0,
            nav:false,
            dots:true,
            autoplay:true,
            autoplayHoverPause:false,
            smartSpeed:900,
            autoplayTimeout:5000         
        });

        /* Testimonial */
        $('.testimonial').owlCarousel({
            items:1,
            loop:true,
            margin:0,
            nav:false,
            dots:true,
            autoplay:true,
            autoplayHoverPause:false,
            smartSpeed:1200,
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
            autoplayTimeout:5000        
        });

        /* Owl Carousel For Partner Logo */
        $('.clients').owlCarousel({
            loop:true,
            margin:30,
            nav:false,
            navText:false,
            autoplay:true,
            smartSpeed:600,
            autoplayTimeout:3000,
            responsive:{
                0:{
                    items:2
                },
                600:{
                    items:3
                },
                800:{
                    items:4
                },
                1000:{
                    items:5
                }
            }
        });
        if (typeof smoothScroll == 'object') {
            smoothScroll.init();
        }

});



$(window).load(function() {


    $('.portfolio').isotope({
        itemSelector: '.portfolio-item',
        transitionDuration: '0.60s',
        percentPosition: true,
        masonry: {
            columnWidth: '.grid-sizer'
        }
    });

    /* Active Class of Portfolio*/
    $('.portfolio-filter ul li').on('click', function(event) {
        $(this).siblings('.active').removeClass('active');
        $(this).addClass('active');
        event.preventDefault();
    });

    /*=== Portfolio filtering ===*/
    $('.portfolio-filter ul').on('click', 'a', function() {
        var filterElement = $(this).attr('data-filter');
        $(this).parents(".portfolio-filter").next().isotope({
            filter: filterElement
        });
    });


    $(".t-circle").fadeOut();
    $("#preloader").delay(200).fadeOut("slow", function(){this.remove()});



});