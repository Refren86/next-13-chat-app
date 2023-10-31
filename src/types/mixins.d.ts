function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null),
      );
    });
  });
}

class User {
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
  accessLevel = 3;
}

class Guest {
  isGuest = true;
  accessLevel = 1;
}

interface User extends Admin, Guest {}

const user: User = new User('John');

console.log(user.isAdmin);

applyMixins(User, [Admin, Guest]);
