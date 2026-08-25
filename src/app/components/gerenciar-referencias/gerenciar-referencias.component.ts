import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ReferenciaModuloService } from 'src/app/services/referencia-modulo.service';
import { ReferenciaModulo } from 'src/interfaces/modulo/referencia-modulo.interface';
import { DialogConfirmarRemocaoComponent } from '../dialog-confirmar-remocao/dialog-confirmar-remocao.component';
import { DialogCriarReferenciaComponent } from '../dialog-criar-referencia/dialog-criar-referencia.component';

@Component({
  selector: 'app-gerenciar-referencias',
  templateUrl: './gerenciar-referencias.component.html',
  styleUrls: ['./gerenciar-referencias.component.css'],
})
export class GerenciarReferenciasComponent {
  moduloId!: number;
  referencias: ReferenciaModulo[] = [];

  constructor(
    private route: ActivatedRoute,
    private referenciaService: ReferenciaModuloService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.moduloId = +this.route.snapshot.paramMap.get('id')!;
    this.carregarReferencias();
  }

  carregarReferencias(): void {
    this.referenciaService
      .getReferenciasByModulo(this.moduloId)
      .subscribe((res) => {
        this.referencias = res;
        console.log(this.referencias)
      });
  }

  adicionarReferencia(): void {
    const dialogRef = this.dialog.open(DialogCriarReferenciaComponent, {
      width: '633px',
      height: '274px',
      panelClass: 'dialog-custom',
      data: {},
    });

    dialogRef.afterClosed().subscribe((dados) => {
      if (dados) {
        this.referenciaService
          .criarReferencia({
            ...dados,
            modulo_id: this.moduloId,
          })
          .subscribe(() => this.carregarReferencias());
      }
    });
  }

  editarReferencia(referencia: ReferenciaModulo): void {
    const dialogRef = this.dialog.open(DialogCriarReferenciaComponent, {
      width: '633px',
      height: '274px',
      panelClass: 'dialog-custom',
      data: { descricao: referencia.descricao },
    });

    dialogRef.afterClosed().subscribe((dadosAtualizados) => {
      if (dadosAtualizados) {
        this.referenciaService
          .atualizarReferencia(referencia.id, dadosAtualizados)
          .subscribe(() => this.carregarReferencias());
      }
    });
  }

  deletarReferencia(referenciaId: number): void {
    const dialogRef = this.dialog.open(DialogConfirmarRemocaoComponent, {
      width: '484px',
      height: '163px',
      panelClass: 'dialog-remove-custom',
      data: {
        titulo: 'Remover Referência',
        mensagem: 'Tem certeza que deseja remover esta referência?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.referenciaService.deletarReferencia(referenciaId).subscribe(() => {
          this.carregarReferencias();
        });
      }
    });
  }
}
