export class GithubUser {
  static async search(username) {
    const endpoint = `https://api.github.com/users/${username}`;

    const req = fetch(endpoint);

    const data = await req;
    const { login, name, public_repos, followers } = await data.json();
    return {
      login,
      name,
      public_repos,
      followers,
    };
  }
}

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.tbody = this.root.querySelector("table tbody");
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      let existUser = this.entries.find((entry) => entry.login === username);

      if (existUser) {
        throw new Error("Usuário já está na lista!");
      }

      const user = await GithubUser.search(username);
      console.log(user);

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado!");
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login != user.login
    );

    this.entries = filteredEntries;
    this.update();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.update();
    this.onAdd();
  }

  onAdd() {
    const btnAdd = this.root.querySelector(".search button");
    btnAdd.addEventListener("click", () => {
      const { value } = this.root.querySelector(".search input");
      this.add(value);
    });
  }

  update() {
    this.removeAllTr();

    this.entries.forEach((user) => {
      const row = this.createRow();
      row.querySelector(
        ".user img"
      ).src = `http://github.com/${user.login}.png`;

      row.querySelector(".user img").alt = `Imagem do perfil de ${user.name}`;

      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").addEventListener("click", () => {
        const isOk = confirm("Tem certeza que deseja deletar essa linha?");
        if (isOk) {
          this.delete(user);
        }
      });

      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="user">
          <img
            src="https://github.com/italoOliveira-dev.png"
            alt="Imagem de Italo Oliveira"
          />
          <a href="https://github.com/italoOliveira-dev" target="_blank">
            <p>Italo Oliveira</p>
            <span>ItaloXd</span>
          </a>
        </td>
        <td class="repositories">76</td>
        <td class="followers">9589</td>
        <td>
          <button class="remove">&times;</button>
        </td>
      </tr>
    `;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((row) => {
      row.remove();
    });
  }
}
