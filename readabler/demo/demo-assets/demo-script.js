window.addEventListener('DOMContentLoaded', () => {
    if ( window.location.protocol === 'file:' && document.querySelector( '#disclaimer' ) ) {
        document.querySelector( '#disclaimer' ).removeAttribute( 'style' );
    }
});
