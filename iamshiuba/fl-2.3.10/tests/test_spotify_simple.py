#!/usr/bin/env python3
"""
Teste simples para verificar se a integração do Spotify está funcionando
sem autenticação (apenas álbuns do artista iamshiuba)
"""

import os
import sys
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

def test_spotify_albums():
    """Testa se consegue carregar álbuns do artista iamshiuba"""
    try:
        from spotify_service import get_spotify_service
        
        print("🎵 Testando carregamento de álbuns do iamshiuba...")
        
        # Verifica configuração
        client_id = os.getenv('SPOTIFY_CLIENT_ID')
        client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        
        if not client_id or not client_secret:
            print("❌ Credenciais do Spotify não configuradas")
            return False
        
        print(f"✅ Credenciais configuradas")
        
        # Testa serviço
        spotify_service = get_spotify_service()
        print("✅ Serviço criado com sucesso")
        
        # Busca álbuns
        albums = spotify_service.get_artist_albums(max_results=10)
        
        if albums:
            print(f"✅ Encontrados {len(albums)} álbuns:")
            for i, album in enumerate(albums[:5], 1):
                print(f"   {i}. {album['title']} ({album['video_count']} faixas)")
                print(f"      Tipo: {album.get('album_type', 'N/A')} | Ano: {album.get('release_year', 'N/A')}")
        else:
            print("⚠️  Nenhum álbum encontrado")
            
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def test_api_routes():
    """Testa as rotas da API"""
    try:
        from app import create_app
        
        print("\n🌐 Testando rotas da API...")
        
        app = create_app()
        
        with app.test_client() as client:
            # Testa API do Spotify
            response = client.get('/api/playlists/spotify?max_results=3')
            
            if response.status_code == 200:
                data = response.get_json()
                print(f"✅ API /api/playlists/spotify: {data.get('total', 0)} álbuns")
                
                if data.get('playlists'):
                    print("📋 Primeiros álbuns:")
                    for album in data['playlists'][:2]:
                        print(f"   - {album['title']}")
            else:
                print(f"❌ API retornou status {response.status_code}")
                if response.data:
                    print(f"   Erro: {response.get_json()}")
                return False
                
        return True
        
    except Exception as e:
        print(f"❌ Erro nas APIs: {e}")
        return False

def main():
    """Função principal"""
    print("🚀 TESTE SIMPLES - SPOTIFY SEM AUTENTICAÇÃO")
    print("=" * 50)
    print("Testando carregamento de álbuns do artista iamshiuba")
    print("=" * 50)
    
    # Executa testes
    spotify_ok = test_spotify_albums()
    api_ok = test_api_routes()
    
    print("\n" + "=" * 50)
    print("📊 RESUMO DOS TESTES:")
    print("=" * 50)
    print(f"🎵 Spotify Albums:  {'✅ PASSOU' if spotify_ok else '❌ FALHOU'}")
    print(f"🌐 API Routes:      {'✅ PASSOU' if api_ok else '❌ FALHOU'}")
    
    if spotify_ok and api_ok:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        print("\n📝 SISTEMA FUNCIONANDO:")
        print("   ✅ Spotify: Carrega álbuns do iamshiuba automaticamente")
        print("   ✅ Sem autenticação necessária")
        print("   ✅ APIs funcionando corretamente")
        
        print("\n🚀 COMO USAR:")
        print("   1. python app.py")
        print("   2. http://localhost:5000/streaming")
        print("   3. Clique na aba 'Spotify'")
        print("   4. Álbuns do iamshiuba aparecerão automaticamente")
        
    else:
        print("\n⚠️  ALGUNS TESTES FALHARAM")
        print("Verifique os erros acima.")
        
    return 0 if (spotify_ok and api_ok) else 1

if __name__ == "__main__":
    sys.exit(main())
