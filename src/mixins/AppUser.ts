import { applyMixins } from '@/lib/utils';

export class AppUser {
  name: string;
  email: string;
  image: string;
  id: string;

  constructor(name: string, email: string, image: string, id: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.image = image;
  }
}

class Admin {
  isAdmin = true;
}

class Guest {
  isGuest = true;
}

export interface AppUser extends Admin, Guest {}

applyMixins(AppUser, [Admin, Guest]);
