// this class is used to create the navigation bar
class iNav extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <header>
    <nav id="navContainer">
      <div id="navBrand">
        <a href="./index.html" class="text-lg font-black">
          <p>IamSHIUBA</p>
        </a>
      </div>
      <div id="desktopMenu">
        <ul>
          <li>
            <a
              href="./index.html"
              class="n-link"
              title="Homepage"
              data-translate="Homepage"
              data-page-target="home"
            ></a>
          </li>
          <li>
            <a
              class="n-link"
              href="./streaming.html"
              title="Streaming"
              data-translate="Streaming"
              data-page-target="streaming"
            ></a>
          </li>
          <li>
            <a
              class="n-link"
              href="./about.html"
              title="About"
              data-translate="About"
              data-page-target="about"
            ></a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
      `;
    }
}
customElements.define('i-nav', iNav);

// this class is used to create the footer

class iFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
<footer>
    <div id="desktopFooter">
      <div id="footer-content">
        <div id="social-links">
          <h4 data-translate="followMe"></h4>
          <div id="social-icons">
            <a
              href="https://twitter.com/iamshiuba"
              target="_blank"
              rel="noopener"
              aria-label="Twitter"
              class="fa-brands fa-x-twitter"
            >
            </a>
            <a
              href="https://soundcloud.com/iamshiuba"
              target="_blank"
              rel="noopener"
              aria-label="SoundCloud"
              class="fa-brands fa-soundcloud"
            >
            </a>
            <a
              href="https://youtube.com/@iamshiuba"
              target="_blank"
              rel="noopener"
              aria-label="YouTube"
              class="fa-brands fa-youtube"
            >
            </a>
            <a
              href="https://open.spotify.com/intl-pt/artist/0e3a6pkhKTpBipDoUdqh8v"
              target="_blank"
              rel="noopener"
              aria-label="Spotify"
              class="fa-brands fa-spotify"
            ></a>
            <a
              href="https://music.apple.com/br/artist/iamshiuba/1717511925"
              target="_blank"
              rel="noopener"
              aria-label="Apple Music"
              class="fa-brands fa-apple text-white"
            ></a>
            <a
              href="https://music.amazon.com.br/artists/B0CNQJGRH3/iamshiuba?marketplaceId=A2Q3Y263D00KWC&musicTerritory=BR&ref=dm_sh_ABVKbpCvqbGHjgpx54uGGKRta"
              target="_blank"
              rel="noopener"
              aria-label="Amazon Music"
              class="fa-brands fa-amazon text-sky-500"
            ></a>
            <a
              href="https://www.deezer.com/en/artist/244339282"
              target="_blank"
              rel="noopener"
              aria-label="Deezer"
              class="fa-brands fa-deezer text-purple-600"
            ></a>
          </div>
        </div>
        <div id="theme-container">
          <h4><span data-translate="theme"></span></h4>
          <div class="flex justify-start w-20">
            <button
              data-theme-toggle
              data-theme-value="light"
              title="Light"
              aria-label="Light"
              class="theme-button mr-2.5"
            >
              <i class="fas fa-sun"></i>
            </button>
            <button
              data-theme-toggle
              data-theme-value="dark"
              title="Dark"
              aria-label="Dark"
              class="theme-button mr-2.5"
            >
              <i class="fas fa-moon"></i>
            </button>
            <button
              data-theme-toggle
              data-theme-value="black"
              title="Black"
              aria-label="Black"
              class="theme-button mr-2.5"
            >
              <i class="fas fa-lightbulb"></i>
            </button>
            <button
              data-theme-toggle
              data-theme-value="red"
              title="Red"
              aria-label="Red"
              class="theme-button"
            >
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
      <div id="footer-bottom">
        <div id="quick-links">
          <h4 data-translate="quickLinks"></h4>
          <ul>
            <li>
              <a
                title="About"
                href="./about.html"
                data-page-target="about"
                data-translate="About"
                class="f-link"
              ></a>
            </li>
            <li>
              <a
                title="Terms"
                href="https://iamshiuba.fly.dev/terms"
                data-page-target="terms"
                data-translate="tos"
                class="f-link"
              ></a>
            </li>
            <li>
              <a
                title="Privacy"
                href="https://iamshiuba.fly.dev/privacy"
                data-page-target="privacy"
                data-translate="privacy"
                class="f-link"
              ></a>
            </li>
            <li>
              <a
                rel="noopener"
                title="Updates"
                href="https://iamshiuba.fly.dev/updates"
                data-translate="updates"
                target="_blank"
                class="f-link"
              ></a>
            </li>
          </ul>
        </div>
        <div id="language-container">
          <h4 data-translate="Translations"></h4>
          <ul id="language" aria-labelledby="language-label" role="list">
            <li class="langItem">
              <a
                data-language="en-US"
                title="English"
                class="fi fi-us"
                aria-label="English"
                ><p>en-US</p></a
              >
            </li>
            <li class="langItem">
              <a
                data-language="pt-BR"
                title="Português"
                class="fi fi-br"
                aria-label="Português"
                ><p>pt-BR</p></a
              >
            </li>
            <li class="langItem">
              <a
                data-language="jp-JP"
                title="日本語"
                class="fi fi-jp"
                aria-label="日本語"
              >
                <p>jp-JP</p></a
              >
            </li>
            <li class="langItem">
              <a
                data-language="ru-RU"
                title="Русский"
                class="fi fi-ru"
                aria-label="Русский"
                ><p>ru-RU</p></a
              >
            </li>
            <li class="langItem">
              <a
                data-language="hi-IN"
                title="हिन्दी"
                class="fi fi-in"
                aria-label="हिन्दी"
                ><p>hi-IN</p></a
              >
            </li>
            <li class="langItem">
              <a data-language="zh-CN" title="中文" class="fi fi-cn"
                ><p>zh-CN</p></a
              >
            </li>
          </ul>
        </div>
      </div>
      <div id="copyright" class="text-center">
        <hr id="f-divider" />
        <p>
          <span data-translate="prdBy"></span> &copy; 2024 -
          ${getCurrentYear()}
          <span data-translate="footer"></span>
        </p>
      </div>
    </div>
  </footer>
        `;
    }
}
customElements.define('i-footer', iFooter);

// this class is used to create the mobile navigation bar
class iMNav extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
 <div id="m-NavContainer">
    <nav>
      <div class="menu-grid">
        <a href="./index.html" class="nav-item" aria-label="Início">
          <i class="fas fa-home"></i>
        </a>

        <button
          aria-label="Menu"
          data-drawer-target="menu-drawer"
          data-drawer-show="menu-drawer"
          data-drawer-placement="left"
          class="nav-item"
        >
          <i class="fas fa-compass"></i>
        </button>

        <button
          aria-label="Redes sociais"
          data-drawer-target="social-drawer"
          data-drawer-show="social-drawer"
          data-drawer-placement="right"
          class="nav-item"
        >
          <i class="fas fa-share-nodes"></i>
        </button>

        <button
          aria-label="Configurações"
          data-drawer-target="config-drawer"
          data-drawer-show="config-drawer"
          data-drawer-placement="right"
          class="nav-item"
        >
          <i class="fas fa-sliders"></i>
        </button>
      </div>
    </nav>

    <div
      id="menu-drawer"
      class="fixed top-0 left-0 z-[51] h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-[var(--background-secondary)] w-80"
      tabindex="-1"
      aria-labelledby="drawer-label"
    >
      <div class="drawer-header">
        <h1 id="drawer-label">Menu</h1>
        <button
          aria-label="Fechar"
          type="button"
          data-drawer-hide="menu-drawer"
          class="drawer-close"
          aria-controls="menu-drawer"
        >
          <i class="fas fa-xmark"></i>
        </button>
      </div>
      <div class="drawer-content">
        <ul>
          <li>
            <a
              title="Homepage"
              href="./index.html"
              class="drawer-link"
              data-page-target="home"
            >
              <i class="fas fa-home"></i>
              <span data-translate="Homepage"></span>
            </a>
          </li>
          <li>
            <a
              title="Streaming"
              href="./streaming.html"
              class="drawer-link"
              data-page-target="streaming"
            >
              <i class="fas fa-play"></i>
              <span data-translate="Streaming"></span>
            </a>
          </li>
          <li>
            <a
              title="About"
              href="./about.html"
              class="drawer-link"
              data-page-target="about"
            >
              <i class="fas fa-info-circle"></i>
              <span data-translate="About"></span>
            </a>
          </li>
          <li>
            <a
              title="Terms"
              href="https://iamshiuba.fly.dev/terms"
              class="drawer-link"
              data-page-target="terms"
            >
              <i class="fas fa-file-contract"></i>
              <span data-translate="tos"></span>
            </a>
          </li>
          <li>
            <a
              title="Privacy"
              href="https://iamshiuba.fly.dev/privacy"
              class="drawer-link"
              data-page-target="privacy"
            >
              <i class="fas fa-shield-halved"></i>
              <span data-translate="privacy"></span>
            </a>
          </li>
          <li>
            <a
              rel="noopener"
              title="Updates"
              href="https://iamshiuba.fly.dev/updates"
              target="_blank"
              class="drawer-link"
            >
              <i class="fas fa-bell"></i>
              <span data-translate="updates"></span>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div
      id="social-drawer"
      class="fixed top-0 right-0 z-[51] h-screen p-4 overflow-y-auto transition-transform translate-x-full bg-[var(--background-secondary)] w-80"
      tabindex="-1"
      aria-labelledby="drawer-label"
    >
      <div class="drawer-header">
        <h1 data-translate="followMe"></h1>
        <button
          aria-label="Fechar"
          type="button"
          data-drawer-hide="social-drawer"
          aria-controls="social-drawer"
          class="drawer-close"
        >
          <i class="fas fa-xmark"></i>
        </button>
      </div>
      <div class="drawer-content">
        <div id="social-icons">
          <a
            href="https://twitter.com/iamshiuba"
            target="_blank"
            rel="noopener"
            aria-label="Twitter"
            class="fa-brands fa-x-twitter"
          >
          </a>
          <a
            href="https://soundcloud.com/iamshiuba"
            target="_blank"
            rel="noopener"
            aria-label="SoundCloud"
            class="fa-brands fa-soundcloud"
          >
          </a>
          <a
            href="https://youtube.com/@iamshiuba"
            target="_blank"
            rel="noopener"
            aria-label="YouTube"
            class="fa-brands fa-youtube"
          >
          </a>
          <a
            href="https://open.spotify.com/intl-pt/artist/0e3a6pkhKTpBipDoUdqh8v"
            target="_blank"
            rel="noopener"
            aria-label="Spotify"
            class="fa-brands fa-spotify"
          ></a>
          <a
            href="https://music.apple.com/br/artist/iamshiuba/1717511925"
            target="_blank"
            rel="noopener"
            aria-label="Apple Music"
            class="fa-brands fa-apple text-white"
          ></a>
          <a
            href="https://music.amazon.com.br/artists/B0CNQJGRH3/iamshiuba?marketplaceId=A2Q3Y263D00KWC&musicTerritory=BR&ref=dm_sh_ABVKbpCvqbGHjgpx54uGGKRta"
            target="_blank"
            rel="noopener"
            aria-label="Amazon Music"
            class="fa-brands fa-amazon text-sky-500"
          ></a>
          <a
            href="https://www.deezer.com/en/artist/244339282"
            target="_blank"
            rel="noopener"
            aria-label="Deezer"
            class="fa-brands fa-deezer text-purple-600"
          ></a>
        </div>
      </div>
    </div>

    <div
      id="config-drawer"
      class="fixed top-0 right-0 z-[51] h-screen p-4 overflow-y-auto transition-transform translate-x-full bg-[var(--background-secondary)] w-80"
      tabindex="-1"
      aria-labelledby="drawer-label"
    >
      <div class="drawer-header">
        <h1 data-translate="config"></h1>
        <button
          aria-label="Fechar"
          type="button"
          data-drawer-hide="config-drawer"
          aria-controls="config-drawer"
          class="drawer-close"
        >
          <i class="fas fa-xmark"></i>
        </button>
      </div>
      <div class="drawer-content">
        <div id="theme-container">
          <h5><span data-translate="theme"></span></h5>
          <div class="flex justify-start w-20">
            <button
              data-theme-toggle
              data-theme-value="light"
              title="Light"
              aria-label="Light"
              class="theme-button mr-2.5"
            >
              <i class="fas fa-sun"></i>
            </button>
            <button
              data-theme-toggle
              data-theme-value="dark"
              title="Dark"
              aria-label="Dark"
              class="theme-button mr-2.5"
            >
              <i class="fas fa-moon"></i>
            </button>
            <button
              data-theme-toggle
              data-theme-value="black"
              title="Black"
              aria-label="Black"
              class="theme-button mr-2.5"
            >
              <i class="fas fa-lightbulb"></i>
            </button>
            <button
              data-theme-toggle
              data-theme-value="red"
              title="Red"
              aria-label="Red"
              class="theme-button"
            >
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>
        <div id="language-container">
          <h5 data-translate="Translations"></h5>
          <ul id="language" aria-labelledby="language-label" role="list">
            <li class="langItem">
              <a
                data-language="en-US"
                title="English"
                class="fi fi-us"
                aria-label="English"
                ><p>en-US</p></a
              >
            </li>
            <li class="langItem">
              <a
                data-language="pt-BR"
                title="Português"
                class="fi fi-br"
                aria-label="Português"
                ><p>pt-BR</p></a
              >
            </li>
            <li class="langItem">
              <a
                data-language="jp-JP"
                title="日本語"
                class="fi fi-jp"
                aria-label="日本語"
              >
                <p>jp-JP</p></a
              >
            </li>
            <li class="langItem">
              <a
                data-language="ru-RU"
                title="Русский"
                class="fi fi-ru"
                aria-label="Русский"
                ><p>ru-RU</p></a
              >
            </li>
            <li class="langItem">
              <a
                data-language="hi-IN"
                title="हिन्दी"
                class="fi fi-in"
                aria-label="हिन्दी"
                ><p>hi-IN</p></a
              >
            </li>
            <li class="langItem">
              <a data-language="zh-CN" title="中文" class="fi fi-cn"
                ><p>zh-CN</p></a
              >
            </li>
          </ul>
        </div>
        <h5 lang="pt-BR">Versão: <b class="text-sm">v3.3.28</b></h5>
      </div>
    </div>
  </div>
        `;
    }
}
customElements.define('i-menu', iMNav);

// this function is used to get the current year
function getCurrentYear() {
    const date = new Date();
    return date.getFullYear();
}
    