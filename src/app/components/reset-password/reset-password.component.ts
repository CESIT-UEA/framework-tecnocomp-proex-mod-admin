import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  email!: string;
  token!: string; 

  redefinirSenha = new FormGroup({
    nova_senha: new FormControl(''),
    confirmar_senha: new FormControl(''),
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
      if (this.redefinirSenha.value.nova_senha == this.redefinirSenha.value.confirmar_senha){
          this.ApiAdmService.resetPassword(
            this.email,
            this.token, 
            this.redefinirSenha.value.nova_senha!
          ).subscribe(data =>{
              this.route.navigate(['/login'])
              this.ApiAdmService.message('Senha redefinida com sucesso')
          })
      }
      // esvazia os campos do formulário
      this.redefinirSenha.reset()
  }
  
}
