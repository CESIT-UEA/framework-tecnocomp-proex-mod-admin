import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { noOnlyWhitespace, senhaForte } from '../validators/validators';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  email!: string;
  token!: string; 

  errorLogin: boolean = false;
  submitted = false;

  hide = true;
  hideDois = true

  redefinirSenha = new FormGroup({
    nova_senha: new FormControl('', [Validators.required, Validators.minLength(8), senhaForte(), noOnlyWhitespace()]),
    confirmar_senha: new FormControl('', [Validators.required]),
  });

  constructor(
    private ApiAdmService: ApiAdmService, 
    private router: ActivatedRoute,
    private route: Router
  ){ }

  ngOnInit(): void {
      this.email = this.router.snapshot.queryParamMap.get('email')!;
      this.token = this.router.snapshot.queryParamMap.get('token')!;
  } 

  submit(){
    this.submitted = true;
      if (this.isSenhaIgual && this.redefinirSenha.valid){
          this.ApiAdmService.resetPassword(
            this.email,
            this.token, 
            this.redefinirSenha.value.nova_senha!
          ).subscribe({
            next: () => {
              this.errorLogin = false;
              
              // esvazia os campos do formulário
              this.redefinirSenha.reset()
              
              this.route.navigate(['/login'])
              
              this.ApiAdmService.message('Senha redefinida com sucesso')
            },
            error: () => {
              this.errorLogin = true;
              this.route.navigate(['/login'])
              this.ApiAdmService.message('Não foi possível redefinir a senha. O link pode ter expirado!')
            }
          })
      }
        if (this.redefinirSenha.invalid || !this.isSenhaIgual){
          this.errorLogin = true;
        }

  }
  

  get isSenhaIgual(){
    return this.redefinirSenha.value.nova_senha === this.redefinirSenha.value.confirmar_senha;
  }
}
