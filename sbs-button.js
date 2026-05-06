class SbsLoginButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  render() {
    // Pega as configurações passadas por atributos no HTML (ou usa valores padrão)
    this.clientId = this.getAttribute('client-id') || 'meu-cliente-web';
    this.authUrl = this.getAttribute('auth-url') || 'http://localhost:8080/oauth2/authorize';
    this.redirectUri = this.getAttribute('redirect-uri') || 'http://127.0.0.1:5500/authorized.html';
    this.scope = this.getAttribute('scope') || 'openid profile';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; }
        .sbs-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ffffff;
          color: #3c4043;
          border: 1px solid #dadce0;
          padding: 0 16px;
          height: 40px;
          border-radius: 4px;
          cursor: pointer;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          transition: background-color 0.2s, box-shadow 0.2s;
        }
        .sbs-btn:hover {
          background-color: #f8f9fa;
          border-color: #d2e3fc;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .sbs-icon {
          width: 18px;
          height: 18px;
          margin-right: 10px;
        }
      </style>
      
      <button class="sbs-btn">
        <img src="http://localhost:8080/icon.ico" class="sbs-icon" alt="SBS">
        <span>Entrar com SBS Connect</span>
      </button>
    `;
  }

  setupEvents() {
    const button = this.shadowRoot.querySelector('button');
    
    // 1. Evento de clique para abrir o Popup
    button.addEventListener('click', () => {
      const width = 500;
      const height = 600;
      const left = (window.screen.width / 2) - (width / 2);
      const top = (window.screen.height / 2) - (height / 2);

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: this.clientId,
        scope: this.scope,
        redirect_uri: this.redirectUri,
        state: Math.random().toString(36).substring(7)
      });

      window.open(
        `${this.authUrl}?${params.toString()}`,
        'sbs_auth_popup',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
      );
    });

    // 2. Ouvinte global para capturar o retorno do authorized.html
    window.addEventListener('message', (event) => {
      // Garante que a mensagem veio da mesma origem da página atual
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'oauth-callback' && event.data.code) {
        // Dispara um evento customizado para o criador da página escutar
        this.dispatchEvent(new CustomEvent('onSuccess', {
          detail: { code: event.data.code },
          bubbles: true,
          composed: true // Permite que o evento atravesse o Shadow DOM
        }));
      }
    });
  }
}

// Registra a tag customizada no navegador
customElements.define('sbs-login-button', SbsLoginButton);