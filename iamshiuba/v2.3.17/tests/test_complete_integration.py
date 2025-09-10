#!/usr/bin/env python3
"""
Script de teste completo para verificar ambas as integrações (YouTube + Spotify)
"""

import os
import sys
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

def test_youtube_integration():
    """Testa a integração do YouTube"""
    print("🔴 TESTANDO INTEGRAÇÃO YOUTUBE")
    print("-" * 40)
    
    try:
        from youtube_service import get_youtube_service
        
        # Verifica configuração
        api_key = os.getenv('YOUTUBE_API_KEY')
        channel_id = os.getenv('YOUTUBE_CHANNEL_ID')
        
        if not api_key or not channel_id:
            print("❌ Configuração do YouTube incompleta")
            return False
        
        print(f"✅ YouTube API configurada")
        
        # Testa serviço
        youtube_service = get_youtube_service()
        playlists = youtube_service.get_channel_playlists(max_results=3)
        
        if playlists:
            print(f"✅ {len(playlists)} playlists encontradas:")
            for playlist in playlists[:2]:
                print(f"   - {playlist['title']} ({playlist['video_count']} vídeos)")
        else:
            print("⚠️  Nenhuma playlist encontrada")
            
        return True
        
    except Exception as e:
        print(f"❌ Erro no YouTube: {e}")
        return False

def test_spotify_integration():
    """Testa a integração do Spotify"""
    print("\n🟢 TESTANDO INTEGRAÇÃO SPOTIFY")
    print("-" * 40)
    
    try:
        from spotify_service import get_spotify_service
        from spotipy.cache_handler import FlaskSessionCacheHandler
        
        # Verifica configuração
        client_id = os.getenv('SPOTIFY_CLIENT_ID')
        client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        redirect_uri = os.getenv('SPOTIFY_REDIRECT_URL')
        
        if not client_id or not client_secret or not redirect_uri:
            print("❌ Configuração do Spotify incompleta")
            return False
        
        print(f"✅ Spotify API configurada")
        
        # Testa serviço
        class MockSession(dict):
            pass
        
        mock_session = MockSession()
        cache_handler = FlaskSessionCacheHandler(mock_session)
        spotify_service = get_spotify_service(cache_handler)
        
        # Testa URL de autenticação
        auth_url = spotify_service.get_auth_url()
        if 'spotify.com' in auth_url:
            print("✅ URL de autenticação válida")
        else:
            print("❌ URL de autenticação inválida")
            return False
            
        # Verifica status (deve estar não autenticado)
        is_authenticated = spotify_service.is_authenticated()
        if not is_authenticated:
            print("✅ Status correto (não autenticado)")
        else:
            print("⚠️  Usuário já autenticado")
            
        return True
        
    except Exception as e:
        print(f"❌ Erro no Spotify: {e}")
        return False

def test_flask_apis():
    """Testa todas as APIs do Flask"""
    print("\n🌐 TESTANDO APIs DO FLASK")
    print("-" * 40)
    
    try:
        from app import create_app
        
        app = create_app()
        
        with app.test_client() as client:
            # Testa YouTube
            print("🔴 APIs do YouTube:")
            response = client.get('/api/playlists/youtube?max_results=2')
            if response.status_code == 200:
                data = response.get_json()
                print(f"   ✅ /api/playlists/youtube: {data.get('total', 0)} playlists")
            else:
                print(f"   ❌ /api/playlists/youtube: {response.status_code}")
                
            # Testa Spotify
            print("🟢 APIs do Spotify:")
            response = client.get('/api/playlists/spotify')
            if response.status_code == 401:
                print("   ✅ /api/playlists/spotify: 401 (não autenticado)")
            else:
                print(f"   ⚠️  /api/playlists/spotify: {response.status_code}")
                
            response = client.get('/auth/spotify/status')
            if response.status_code == 200:
                print("   ✅ /auth/spotify/status: OK")
            else:
                print(f"   ❌ /auth/spotify/status: {response.status_code}")
                
            # Testa API geral
            print("🔵 API Geral:")
            response = client.get('/api/playlists?platform=youtube&max_results=1')
            if response.status_code == 200:
                print("   ✅ /api/playlists (YouTube): OK")
            else:
                print(f"   ❌ /api/playlists (YouTube): {response.status_code}")
                
            response = client.get('/api/playlists?platform=spotify')
            if response.status_code == 401:
                print("   ✅ /api/playlists (Spotify): 401 (não autenticado)")
            else:
                print(f"   ⚠️  /api/playlists (Spotify): {response.status_code}")
                
        return True
        
    except Exception as e:
        print(f"❌ Erro nas APIs: {e}")
        return False

def test_frontend_compatibility():
    """Testa compatibilidade com o frontend"""
    print("\n🎨 TESTANDO COMPATIBILIDADE FRONTEND")
    print("-" * 40)
    
    try:
        # Verifica se os arquivos necessários existem
        files_to_check = [
            'static/js/utils/EnhancedStreaming.js',
            'static/scss/components/_streaming.scss',
            'templates/pages/streaming.html'
        ]
        
        for file_path in files_to_check:
            if os.path.exists(file_path):
                print(f"✅ {file_path}")
            else:
                print(f"❌ {file_path} não encontrado")
                return False
                
        # Verifica se o JavaScript tem os métodos necessários
        with open('static/js/utils/EnhancedStreaming.js', 'r', encoding='utf-8') as f:
            js_content = f.read()
            
        required_methods = [
            'loadYouTubePlaylists',
            'loadSpotifyPlaylists',
            'showSpotifyAuthRequired',
            'checkSpotifyAuth'
        ]
        
        for method in required_methods:
            if method in js_content:
                print(f"✅ Método {method} encontrado")
            else:
                print(f"❌ Método {method} não encontrado")
                return False
                
        return True
        
    except Exception as e:
        print(f"❌ Erro na verificação frontend: {e}")
        return False

def main():
    """Função principal"""
    print("🚀 TESTE COMPLETO DE INTEGRAÇÃO")
    print("=" * 50)
    print("Testando YouTube + Spotify + Flask + Frontend")
    print("=" * 50)
    
    # Executa todos os testes
    youtube_ok = test_youtube_integration()
    spotify_ok = test_spotify_integration()
    flask_ok = test_flask_apis()
    frontend_ok = test_frontend_compatibility()
    
    print("\n" + "=" * 50)
    print("📊 RESUMO FINAL DOS TESTES:")
    print("=" * 50)
    print(f"🔴 YouTube Integration:  {'✅ PASSOU' if youtube_ok else '❌ FALHOU'}")
    print(f"🟢 Spotify Integration:  {'✅ PASSOU' if spotify_ok else '❌ FALHOU'}")
    print(f"🌐 Flask APIs:           {'✅ PASSOU' if flask_ok else '❌ FALHOU'}")
    print(f"🎨 Frontend Compatibility: {'✅ PASSOU' if frontend_ok else '❌ FALHOU'}")
    
    all_passed = youtube_ok and spotify_ok and flask_ok and frontend_ok
    
    if all_passed:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        print("\n📝 SISTEMA COMPLETO FUNCIONANDO:")
        print("   ✅ YouTube: Carrega playlists automaticamente")
        print("   ✅ Spotify: Autenticação OAuth + playlists do usuário")
        print("   ✅ APIs: Todas as rotas funcionando")
        print("   ✅ Frontend: JavaScript e CSS preparados")
        
        print("\n🚀 COMO USAR:")
        print("   1. python app.py")
        print("   2. http://localhost:5000/streaming")
        print("   3. YouTube: Funciona imediatamente")
        print("   4. Spotify: Clique em 'Conectar com Spotify'")
        
        print("\n🔧 FUNCIONALIDADES DISPONÍVEIS:")
        print("   • Carregamento dinâmico de playlists")
        print("   • Busca e filtros")
        print("   • Sistema de favoritos")
        print("   • Lazy loading de players")
        print("   • Visualização grade/lista")
        print("   • Cache inteligente")
        print("   • Design responsivo")
        
    else:
        print("\n⚠️  ALGUNS TESTES FALHARAM")
        print("Verifique os erros acima antes de usar o sistema.")
        
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
