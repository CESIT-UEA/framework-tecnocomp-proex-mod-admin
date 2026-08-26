import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { jwtDecode} from 'jwt-decode';
import { ApiAdmService } from 'src/app/services/api-adm.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  errorLogin: boolean = false;
  focus = false;
  submitted = false;
  hide = true;
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    senha: new FormControl('', Validators.required)
  });

 
  constructor(private authService: AuthService, private router: Router, private apiService: ApiAdmService) {
      this.loginForm.valueChanges.subscribe(() => {
      this.errorLogin = false;
    });
  }

  ngOnInit(): void {
    (window as any).handleCredentialResponse = (response: any) => {
      const idTokenGoogle = response.credential;

      this.authService.loginWithGoogle(idTokenGoogle).subscribe({
        next: (res: any) => {
          this.authService.setToken(res.accessToken); // salva JWT do backend
          const usuarioDados = this.authService.decodeToken(res.accessToken);
          console.log()
          this.authService.setUsuario(usuarioDados);
          this.router.navigate(['/tecnocomp/meu-perfil']);
        },
        error: (err) => {
          this.apiService.message(err.error)
          console.error("Erro login Google:", err);
        }
      });
    };

    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }

  get email(){
      return this.loginForm.get('email')!;
  }

  get senha(){
      return this.loginForm.get('senha')!;
  }



  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid){
      this.loginForm.markAllAsTouched()
      return
    }

    if (this.loginForm.valid) {
      this.errorLogin = false;

      this.authService.login(this.loginForm.value.email!, this.loginForm.value.senha!).subscribe(
        (response: any) => {
          console.log(response);

          // Salva o accessToken no localStorage
          this.authService.setToken(response.accessToken);

          // Decodifica o accessToken
          const usuarioDados = this.authService.decodeToken(response.accessToken);

          if (usuarioDados) {
            // Salva os dados do usuário no localStorage
            this.authService.setUsuario(usuarioDados);

            // Navega para o dashboard
            this.router.navigate(['/tecnocomp/meu-perfil']);
            console.log(this.authService.getUsuarioDados());
          } else {
            this.errorLogin = true;
            console.error('Erro: Access Token inválido ou corrompido.');
          }
        },
        (error) => {
          this.apiService.message(error.error.error)
          this.errorLogin = true;
          this.loginForm.markAllAsTouched()
          console.error('Erro ao fazer login:', error);
        }
      );
    }
  }


  focusClick(state:boolean = false):void{
    if (state) {
      this.focus = true
    }else{
      this.focus = false
    }
  }


}
