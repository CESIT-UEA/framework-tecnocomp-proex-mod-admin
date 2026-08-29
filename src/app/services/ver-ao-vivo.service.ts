import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VerAoVivoService {
  public apiUrl = environment.baseUrl;
  player: any;
  playerCapa: any;
  public currentVideoIndex: number = 0;
  private storageKey = 'dados_completos_do_modulo';
  public dados_completos: any = [];
  notaTotal: number = 0;
  perfilUser = false;
  controll_topico: number = 0

  constructor(private http: HttpClient) {}

  abreMenuUser() {
    this.perfilUser = true;
    console.log('Abrindo menu');
  }

  fechaMenuUser() {
    this.perfilUser = false;
    console.log('Fechou menu User');
  }

  getDadosCompletos(): void {
    this.dados_completos = localStorage.getItem(this.storageKey);
    if (this.dados_completos) {
      this.dados_completos = JSON.parse(this.dados_completos);
      this.notaTotal = this.dados_completos?.userModulo?.nota;

      console.log('Service data 3: ', this.dados_completos);
    }
  }

  setDadosCompletos(dados: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(dados));

    this.getDadosCompletos();
  }

  removeDadosCompletos(): void {
    localStorage.removeItem(this.storageKey);
  }

   loadYouTubeAPI(): void {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);

      (window as any).onYouTubeIframeAPIReady = () => {
        this.recreatePlayer();
      };
    }
  }

  loadYouTubeAPICapa(): void {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);

      (window as any).onYouTubeIframeAPIReady = () => {
        this.recreatePlayerCapa();
      };
    } else {
      // API já foi carregada
      this.recreatePlayerCapa();
    }
  }

  recreatePlayerCapa(): void {
    if (this.playerCapa) {
      this.playerCapa.destroy(); // Destroi o player existente
    }

    const videoId = this.extractVideoId(
      this.dados_completos.video_inicial
    );

    this.playerCapa = new (window as any).YT.Player('player-capa', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        rel: 0,
        enablejsapi: 1,
      },
      events: {
        onReady: this.onPlayerReady.bind(this),
        onStateChange: this.onPlayerStateChange.bind(this),
      },
    });

  }

  salvarIdTopico(){
    localStorage.setItem('idTopico', JSON.stringify(this.controll_topico))
  }

  getIdTopico(){
    const idTopico = localStorage.getItem('idTopico') || 0
    console.log(idTopico, 'idTopico', typeof idTopico)
    return Number(idTopico);
  }

  removerIdTopico(){
    localStorage.removeItem('idTopico');
  }

  extractVideoId(url: string): string {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : '';
  }

  onPlayerReady(event: any): void {
    console.log('Player está pronto!');
  }

  recreatePlayer(): void {
    if (this.player) {
      console.log('Caiu aqui');
      this.player.destroy(); // Destroi o player existente
    }

    const videoId = this.extractVideoId(
      this.dados_completos.Topicos?.[this.controll_topico]
        ?.VideoUrls[this.currentVideoIndex].url
    );

    this.player = new (window as any).YT.Player('player', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        rel: 0,
        enablejsapi: 1,
      },
      events: {
        onReady: this.onPlayerReady.bind(this),
        onStateChange: this.onPlayerStateChange.bind(this),
      },
    });
    console.log(this.player);
  }

  onPlayerStateChange(event: any): void {
    console.log('Estado do player:', event.data);
    if (event.data == 0) {
      if (
        this.dados_completos.Topicos?.[this.controll_topico]
          ?.VideoUrls[this.currentVideoIndex].UsuarioVideos[0].completo == false
      ) {
        this.finalizarVideo(
          this.dados_completos.user.ltiUserId,
          this.dados_completos.Topicos?.[this.controll_topico]
            ?.VideoUrls[this.currentVideoIndex].id,
          this.dados_completos.user.ltik
        ).subscribe((response) => {
          console.log('Vídeo finalizado:', response);
          this.removeDadosCompletos();
          this.setDadosCompletos(response);
        });
      }
      /*       setTimeout(() => {
        this.proximo();
      }, 3000); */
    }
  }

  finalizarVideo(
    ltiUserId: string,
    videoId: number,
    ltik: string
  ): Observable<any> {
    const body = { ltiUserId, videoId, ltik };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.dados_completos.user.ltik,
    });

    return this.http.post(`${this.apiUrl}/finalizar-video`, body, { headers });
  }


  salvarProgressoVideos(): Observable<any> {
    const body = {
      id_video: this.currentVideoIndex,
      id_topico:
        this.dados_completos.Topicos?.[this.controll_topico].id,
      ltik: this.dados_completos.user.ltik,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.dados_completos.user.ltik,
    });

    return this.http.post(`${this.apiUrl}/salvar-progresso-video`, body, {
      headers,
    });
  }

  voltar(): void {
    if (this.currentVideoIndex - 1 >= 0) {
      console.log(this.currentVideoIndex);
      this.currentVideoIndex = this.currentVideoIndex - 1;
      this.recreatePlayer();
    }

    this.salvarProgressoVideos().subscribe((response) => {
      console.log('Progresso salvo:', response);
      this.removeDadosCompletos();
      this.setDadosCompletos(response);
    });
  }

  proximo(): void {
    console.log(this.currentVideoIndex);
    if (
      this.currentVideoIndex <
      this.dados_completos.Topicos?.[this.controll_topico]
        ?.VideoUrls.length
    ) {
      console.log('Entrei');
      this.currentVideoIndex++;
      this.recreatePlayer();
    }
    this.salvarProgressoVideos().subscribe((response) => {
      console.log('Progresso salvo:', response);
      this.removeDadosCompletos();
      this.setDadosCompletos(response);
    });
  }

}
