import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { VerAoVivoService } from 'src/app/services/ver-ao-vivo.service';

@Component({
  selector: 'app-video-section',
  templateUrl: './video-section.component.html',
  styleUrls: ['./video-section.component.css']
})
export class VideoSectionComponent implements OnInit, AfterViewInit, OnDestroy{
  @Input() videoUrl!: any;

  constructor(public ltiService: VerAoVivoService){}

  ngOnInit(): void {
    this.ltiService.loadYouTubeAPICapa()
  }

  ngAfterViewInit(): void {
    this.ltiService.recreatePlayerCapa();
  }

  ngOnDestroy(): void {
    if (this.ltiService.playerCapa) {
      this.ltiService.playerCapa.destroy();
      this.ltiService.playerCapa = null;
    }
  }
}
