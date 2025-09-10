document.addEventListener("DOMContentLoaded", function () {
  const footer = document.getElementById("footer");
  footer.innerHTML = `
        <div class="col-4" id="checkOut">
            <a href="https://github.com/ishiuba"target="_blank" title="GitHub" rel="noopener" aria-label="GitHub">
                <i class="fa-brands fa-github"></i>
            </a>
            <a href="https://x.com/iamshiuba" target="_blank" title="X (Twitter)" rel="noopener" aria-label="X (Twitter)">
                <i class="fa-brands fa-x-twitter"></i>
            </a>
            <a href="https://www.youtube.com/@iamshiuba" target="_blank" title="YouTube" rel="noopener" aria-label="YouTube">
                <i class="fa-brands fa-youtube"></i>
            </a>
            <a href="https://soundcloud.com/iamshiuba" target="_blank" title="SoundCloud" rel="noopener" aria-label="SoundCloud">
                <i class="fa-brands fa-soundcloud"></i>
            </a>
            <a href="https://iamshiuba.fly.dev" target="_blank" title="IamSHIUBA Website" rel="noopener">
                <i class="fa-solid fa-house"></i>
            </a>
        </div>
        <div class="col-8 d-flex" id="footer">
            <p class="mb-0">
                <span data-translate="prdBy"></span>  &copy; ${new Date().getFullYear()}.
                <span data-translate="footer"></span>
            </p>
        </div>
`;
});
