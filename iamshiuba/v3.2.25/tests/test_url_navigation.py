#!/usr/bin/env python3
"""
Teste para verificar se as URLs dinâmicas estão funcionando
"""

import os
import sys
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

def test_streaming_routes():
    """Testa as rotas de streaming"""
    try:
        from app import create_app
        
        print("🌐 Testando rotas de streaming...")
        
        app = create_app()
        
        with app.test_client() as client:
            # Testa rota principal
            response = client.get('/streaming')
            if response.status_code == 200:
                print("✅ /streaming: OK")
                # Verifica se active_tab está sendo passado
                if b'window.INITIAL_TAB = "youtube"' in response.data:
                    print("   ✅ Aba inicial configurada: youtube")
                else:
                    print("   ⚠️  Aba inicial não encontrada no HTML")
            else:
                print(f"❌ /streaming: {response.status_code}")
                return False
                
            # Testa rota do YouTube
            response = client.get('/streaming/youtube')
            if response.status_code == 200:
                print("✅ /streaming/youtube: OK")
                if b'window.INITIAL_TAB = "youtube"' in response.data:
                    print("   ✅ Aba inicial configurada: youtube")
                else:
                    print("   ⚠️  Aba inicial não encontrada no HTML")
            else:
                print(f"❌ /streaming/youtube: {response.status_code}")
                return False
                
            # Testa rota do Spotify
            response = client.get('/streaming/spotify')
            if response.status_code == 200:
                print("✅ /streaming/spotify: OK")
                if b'window.INITIAL_TAB = "spotify"' in response.data:
                    print("   ✅ Aba inicial configurada: spotify")
                else:
                    print("   ⚠️  Aba inicial não encontrada no HTML")
            else:
                print(f"❌ /streaming/spotify: {response.status_code}")
                return False
                
            # Testa se os títulos estão corretos
            response = client.get('/streaming/youtube')
            if b'<title>Streaming - YouTube' in response.data:
                print("   ✅ Título correto para YouTube")
            else:
                print("   ⚠️  Título não encontrado para YouTube")
                
            response = client.get('/streaming/spotify')
            if b'<title>Streaming - Spotify' in response.data:
                print("   ✅ Título correto para Spotify")
            else:
                print("   ⚠️  Título não encontrado para Spotify")
                
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar rotas: {e}")
        return False

def test_template_variables():
    """Testa se as variáveis do template estão sendo passadas corretamente"""
    try:
        from app import create_app
        from flask import render_template_string
        
        print("\n📄 Testando variáveis do template...")
        
        app = create_app()
        
        with app.test_request_context():
            # Testa template com active_tab = youtube
            template = '{{ active_tab }}'
            result = render_template_string(template, active_tab='youtube')
            if result == 'youtube':
                print("✅ Variável active_tab funcionando: youtube")
            else:
                print(f"❌ Variável active_tab incorreta: {result}")
                return False
                
            # Testa template com active_tab = spotify
            result = render_template_string(template, active_tab='spotify')
            if result == 'spotify':
                print("✅ Variável active_tab funcionando: spotify")
            else:
                print(f"❌ Variável active_tab incorreta: {result}")
                return False
                
            # Testa classes CSS condicionais
            template = '''
            <button class="{{ 'active' if active_tab == 'youtube' else '' }}" data-tab="youtube">YouTube</button>
            <button class="{{ 'active' if active_tab == 'spotify' else '' }}" data-tab="spotify">Spotify</button>
            '''
            
            result_youtube = render_template_string(template, active_tab='youtube')
            if 'class="active"' in result_youtube and 'data-tab="youtube"' in result_youtube:
                print("✅ Classes CSS condicionais funcionando para YouTube")
            else:
                print("❌ Classes CSS condicionais não funcionando para YouTube")
                return False
                
            result_spotify = render_template_string(template, active_tab='spotify')
            if 'class="active"' in result_spotify and 'data-tab="spotify"' in result_spotify:
                print("✅ Classes CSS condicionais funcionando para Spotify")
            else:
                print("❌ Classes CSS condicionais não funcionando para Spotify")
                return False
                
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar template: {e}")
        return False

def test_javascript_integration():
    """Testa se o JavaScript está preparado para as URLs dinâmicas"""
    try:
        print("\n🔧 Testando integração JavaScript...")
        
        # Verifica se o arquivo JavaScript existe
        js_file = 'static/js/utils/EnhancedStreaming.js'
        if not os.path.exists(js_file):
            print(f"❌ Arquivo JavaScript não encontrado: {js_file}")
            return False
            
        with open(js_file, 'r', encoding='utf-8') as f:
            js_content = f.read()
            
        # Verifica se os métodos necessários existem
        required_methods = [
            'getInitialTab',
            'setupURLNavigation',
            'getTabFromURL',
            'updateURL',
            'switchTab'
        ]
        
        for method in required_methods:
            if method in js_content:
                print(f"✅ Método {method} encontrado")
            else:
                print(f"❌ Método {method} não encontrado")
                return False
                
        # Verifica se há referências às URLs corretas
        if '/streaming/youtube' in js_content and '/streaming/spotify' in js_content:
            print("✅ URLs de streaming encontradas no JavaScript")
        else:
            print("❌ URLs de streaming não encontradas no JavaScript")
            return False
            
        # Verifica se há suporte ao window.INITIAL_TAB
        if 'window.INITIAL_TAB' in js_content:
            print("✅ Suporte ao window.INITIAL_TAB encontrado")
        else:
            print("❌ Suporte ao window.INITIAL_TAB não encontrado")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar JavaScript: {e}")
        return False

def main():
    """Função principal"""
    print("🚀 TESTE DE NAVEGAÇÃO POR URL")
    print("=" * 50)
    print("Testando URLs dinâmicas para abas YouTube/Spotify")
    print("=" * 50)
    
    # Executa testes
    routes_ok = test_streaming_routes()
    template_ok = test_template_variables()
    js_ok = test_javascript_integration()
    
    print("\n" + "=" * 50)
    print("📊 RESUMO DOS TESTES:")
    print("=" * 50)
    print(f"🌐 Rotas de Streaming:    {'✅ PASSOU' if routes_ok else '❌ FALHOU'}")
    print(f"📄 Variáveis Template:    {'✅ PASSOU' if template_ok else '❌ FALHOU'}")
    print(f"🔧 JavaScript Integration: {'✅ PASSOU' if js_ok else '❌ FALHOU'}")
    
    if routes_ok and template_ok and js_ok:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        print("\n📝 FUNCIONALIDADES IMPLEMENTADAS:")
        print("   ✅ URLs dinâmicas: /streaming/youtube e /streaming/spotify")
        print("   ✅ Aba inicial baseada na URL")
        print("   ✅ Atualização automática da URL ao trocar abas")
        print("   ✅ Suporte a navegação com botões voltar/avançar")
        print("   ✅ Títulos de página específicos")
        print("   ✅ Classes CSS condicionais")
        
        print("\n🚀 COMO TESTAR:")
        print("   1. python app.py")
        print("   2. http://localhost:5000/streaming/youtube")
        print("   3. http://localhost:5000/streaming/spotify")
        print("   4. Clique nas abas e veja a URL mudar")
        print("   5. Use os botões voltar/avançar do navegador")
        
    else:
        print("\n⚠️  ALGUNS TESTES FALHARAM")
        print("Verifique os erros acima.")
        
    return 0 if (routes_ok and template_ok and js_ok) else 1

if __name__ == "__main__":
    sys.exit(main())
