#!/usr/bin/env python3
"""
Script de teste para verificar a integração com o YouTube API
"""

import os
import sys
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

def test_youtube_service():
    """Testa o serviço do YouTube"""
    try:
        from youtube_service import get_youtube_service
        
        print("🔍 Testando serviço do YouTube...")
        
        # Verifica se as variáveis de ambiente estão configuradas
        api_key = os.getenv('YOUTUBE_API_KEY')
        channel_id = os.getenv('YOUTUBE_CHANNEL_ID')
        
        if not api_key:
            print("❌ YOUTUBE_API_KEY não encontrada no arquivo .env")
            return False
            
        if not channel_id:
            print("❌ YOUTUBE_CHANNEL_ID não encontrada no arquivo .env")
            return False
            
        print(f"✅ API Key configurada: {api_key[:10]}...")
        print(f"✅ Channel ID configurado: {channel_id}")
        
        # Testa a criação do serviço
        youtube_service = get_youtube_service()
        print("✅ Serviço do YouTube criado com sucesso")
        
        # Testa busca de playlists
        print("\n🎵 Buscando playlists do canal...")
        playlists = youtube_service.get_channel_playlists(max_results=5)
        
        if playlists:
            print(f"✅ Encontradas {len(playlists)} playlists:")
            for i, playlist in enumerate(playlists[:3], 1):
                print(f"  {i}. {playlist['title']} ({playlist['video_count']} vídeos)")
        else:
            print("⚠️  Nenhuma playlist encontrada")
            
        # Testa playlist em destaque
        print("\n⭐ Buscando playlist em destaque...")
        featured = youtube_service.get_featured_playlist()
        
        if featured:
            print(f"✅ Playlist em destaque: {featured['title']}")
        else:
            print("⚠️  Nenhuma playlist em destaque encontrada")
            
        return True
        
    except ImportError as e:
        print(f"❌ Erro ao importar módulo: {e}")
        return False
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")
        return False

def test_flask_routes():
    """Testa as rotas do Flask"""
    try:
        from app import create_app
        
        print("\n🌐 Testando rotas do Flask...")
        
        app = create_app()
        
        with app.test_client() as client:
            # Testa rota de saúde
            response = client.get('/health')
            if response.status_code == 200:
                print("✅ Rota /health funcionando")
            else:
                print(f"❌ Rota /health retornou {response.status_code}")
                
            # Testa rota de playlists do YouTube
            print("🎵 Testando rota /api/playlists/youtube...")
            response = client.get('/api/playlists/youtube?max_results=3')
            
            if response.status_code == 200:
                data = response.get_json()
                print(f"✅ API retornou {data.get('total', 0)} playlists")
                
                if data.get('playlists'):
                    print("📋 Primeiras playlists:")
                    for playlist in data['playlists'][:2]:
                        print(f"  - {playlist['title']}")
            else:
                print(f"❌ API retornou status {response.status_code}")
                if response.data:
                    print(f"   Erro: {response.get_json()}")
                    
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar Flask: {e}")
        return False

def main():
    """Função principal"""
    print("🚀 Iniciando testes da integração YouTube...")
    print("=" * 50)
    
    # Testa serviço do YouTube
    youtube_ok = test_youtube_service()
    
    # Testa rotas do Flask
    flask_ok = test_flask_routes()
    
    print("\n" + "=" * 50)
    print("📊 RESUMO DOS TESTES:")
    print(f"  YouTube Service: {'✅ OK' if youtube_ok else '❌ FALHOU'}")
    print(f"  Flask Routes: {'✅ OK' if flask_ok else '❌ FALHOU'}")
    
    if youtube_ok and flask_ok:
        print("\n🎉 Todos os testes passaram! A integração está funcionando.")
        print("\n📝 Próximos passos:")
        print("  1. Inicie o servidor: python app.py")
        print("  2. Acesse: http://localhost:5000/streaming")
        print("  3. Teste a busca de playlists do YouTube")
    else:
        print("\n⚠️  Alguns testes falharam. Verifique os erros acima.")
        
    return 0 if (youtube_ok and flask_ok) else 1

if __name__ == "__main__":
    sys.exit(main())
