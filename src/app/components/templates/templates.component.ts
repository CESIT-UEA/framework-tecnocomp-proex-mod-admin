import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { PaginationService, PaginationState } from 'src/app/services/pagination.service';
import { Modulo } from 'src/interfaces/modulo/Modulo';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css'],
})
export class TemplatesComponent implements OnInit {
  modulos: Modulo[] = [];
  pagination: PaginationState;
  totalModulos: number = 0;
  quantidadeItens!: number;
  carregando: boolean = false;

  constructor(
    public apiService: ApiAdmService,
    private paginationService: PaginationService,
    private authService: AuthService,
    private router: Router
  ) {
    this.pagination = this.paginationService.createPaginationState()
  }

  // Handler para mudanças de página
  onPageChange(page: number, quantidadeItens: number): void {
    this.setPageStorage(page);
    this.listarTemplates(page);
  }

  ngOnInit(): void {
    const pageStorage = this.getPageStorage();
    if (pageStorage) {
      this.pagination.currentPage = pageStorage;
    }

    this.listarTemplates(this.pagination.currentPage)
  }

  getPageStorage() {
    const pagePlat = localStorage.getItem('pageTemp');
    if (pagePlat) {
      return Number(pagePlat);
    }
    return null
  }

  setPageStorage(page: number) {
    localStorage.setItem('pageTemp', JSON.stringify(page));
  }

  listarTemplates(page: number) {
    this.apiService.listarTemplates(page, 2).subscribe({
      next: (response) => {
        this.modulos = response.templates;
        this.quantidadeItens = response.infoTemplates.totalRegistros
        this.paginationService.updatePaginationState(
          this.pagination,
          response.infoTemplates.totalPaginas,
          response.infoTemplates.totalRegistros

        )

      },
      error: (error) => {
        console.error('Erro ao carregar templates:', error);
      }
    }
    )
  }



  clonarTemplate(modulo: Modulo) {
    if (!modulo.id) return;

    this.carregando = true;

    this.apiService.clonarTemplate(modulo.id).subscribe({
            next: () => {
              this.apiService.message(`Módulo ${modulo.nome_modulo} clonado com sucesso`)

              this.carregando = false

              if (this.authService.isAdmin()) {
                this.router.navigate(['/tecnocomp/modulos'])
              } else {
                this.router.navigate(['/tecnocomp/meus-modulos'])
              }
            },
            error: (err) => {
              this.carregando = false
              this.apiService.message('Erro ao clonar template!');
              console.error('Erro ao clonar template', err);
            }
          });
  }
}
