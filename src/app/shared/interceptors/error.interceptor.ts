import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Une erreur est survenue.';

      if (error.status === 0) {
        message = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      } else if (error.status === 401) {
        message = 'Session expirée. Veuillez vous reconnecter.';
      } else if (error.status === 403) {
        message = 'Accès non autorisé.';
      } else if (error.status === 404) {
        message = 'Ressource introuvable.';
      } else if (error.status >= 500) {
        message = 'Erreur serveur. Veuillez réessayer plus tard.';
      }

      // Attach user-friendly message to the error
      const enrichedError = new HttpErrorResponse({
        error: { ...error.error, userMessage: message },
        headers: error.headers,
        status: error.status,
        statusText: error.statusText,
        url: error.url ?? undefined,
      });

      return throwError(() => enrichedError);
    })
  );
};
