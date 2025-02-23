/* This JavaScript code snippet is implementing lazy loading for iframes with a `data-src` attribute.
Here's a breakdown of what each part of the code is doing: */
const lazyIframes = document.querySelectorAll('iframe[data-src]');

const lazyLoad = target => {
    const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                iframe.src = iframe.dataset.src;
                observer.disconnect();
            }
        });
    });

    io.observe(target);
};

lazyIframes.forEach(lazyLoad);
