export class GlobleMiddleware {
  public static genrateId(length = 12): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let id = '';

    for (var i = 0; i < length; i++) {
      id += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return id;
  }
}
