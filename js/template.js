
window.onload = function() {
document.querySelector("footer").innerHTML = `
<p>Auteurs: Pao DELORME et Thomas SANDIER<br>
<a href="mailto:boutiquemauve@outlook.com?subject=Demande de renseignements &body=Bonjour, je souhaiterais obtenir des renseignements sur">boutiquemauve@outlook.com</a></p>
<p>Localisation : 3 rue Victor Grignard, 69100 Villeurbanne
<p>Numéro de téléphone : 06 66 66 66 66</p>

</p>
`;}



// recuperation de la valeur de l'id qui est transmise dans l'url
let produit_id = new URLSearchParams(window.location.search).get("id")
console.log(produit_id);
// creation de la classe Pull
class Pull {
    constructor(id, nom, image, prix) {
        this.id = id
        this.nom = nom
        this.image = image
        this.prix = prix
    }
}

// recuperation des données du json
let Pulls = [];
let url = '../json/banque.json';
fetch(url)
.then(res => res.json())
.then(function(response) {
    for (i = 0; i < response["hoodie-list"].length; i++) {
        console.log(response["hoodie-list"][i].id);
        temp_pull = new Pull(response["hoodie-list"][i]["id"], response["hoodie-list"][i]["nom"], response["hoodie-list"][i]["calque1"], response["hoodie-list"][i]['prix']);
        Pulls.push(temp_pull);
    }
    // récupération de la div qui porte l'identifiant nomdiv
    let template = document.querySelector("#nomdiv");
    console.log("Pulls:",Pulls);
    for (i = 0; i < Pulls.length; i++) {
        console.log("-",Pulls[i].id,"/ ",produit_id);
        if (Pulls[i].id == produit_id) {
            
            let nom = document.getElementById("nom");
            nom.innerHTML = Pulls[i].nom;

            let image = document.getElementById("image");
            image.src = Pulls[i].image;

            let prix = document.getElementById("prix");
            prix.innerHTML = Pulls[i].prix;

        }
    }
});

//Fonction qui superpose les images

function generation_image(self)
{
  const params = new URLSearchParams(window.location.search);
  var c0 = `../images/c0/mauve${params.get('id')}.png`;
  var c1 = self.value;
  document.getElementById("image-produit").innerHTML = `<canvas height="800" width="800" id="produit-img-canvas" ></canvas>`;
  var canvas_e = document.querySelector('#produit-img-canvas');
  var ctx = canvas_e.getContext("2d");
  console.log("Changing the image");
  // Calque 1
  var img_c0 = new Image(); 
  img_c0.src = c0;
  img_c0.onload = function() {
    ctx.drawImage(img_c0,0,0);
    // Calque 1
    var img_c1 = new Image(); 
    img_c1.src = c1; 
    img_c1.onload = function() {
      ctx.drawImage(img_c1,0,0);
    };
  };   
}

//fonction qui affiche le panier

function afficher_panier() {
  var TOUT_PRODUIT = [];
  var PRIX_TOTAL = 0; // Variable auxiliaire pour stocker le prix total

  fetch("../json/banque.json")
    .then(res => res.json())
    .then(function (response) {
      TOUT_PRODUIT = response["hoodie-list"];
      panier = JSON.parse(localStorage.getItem("panier"));
      html_content = "<ul>";
      for (i = 0; i < panier.length; i++) {
        const prod_id = panier[i]["modele_id"];
        const prod_collab = panier[i]["modele_collab"];
        const prod_taille = panier[i]["modele_taille"];
        const prod_quantite = panier[i]["quantité"];

        // On récupère le prix unitaire de chaque article en fonction de son ID et sa collaboration, depuis le fichier banque.json

        const prod_prix_unitaire = TOUT_PRODUIT[prod_id]["prix"];

        // On calcule le prix total pour cet article
        console.log("=pp", prod_prix_unitaire, prod_quantite);
        let prod_prix_total = prod_prix_unitaire * prod_quantite;

        // Si on commande plus de 10 articles similaires, on applique une réduction de 10%
        if (prod_quantite >= 10) {
          const remise = prod_prix_total * 0.1;
          prod_prix_total = prod_prix_total - remise;
        }

        // On ajoute le prix total de cet article dans le prix total global
        PRIX_TOTAL += prod_prix_total;
        collab = prod_collab.split('/');
        collab = collab[collab.length - 1].split('.')[0];
        html_content +=
          `<li><img src="${TOUT_PRODUIT[prod_id]["calque1"]}" width="200" height="200"> ${TOUT_PRODUIT[prod_id]["nom"]} - ` +
          `collab : ${collab} - Taille : ${prod_taille} - quantité : x${prod_quantite} - Prix total: ${prod_prix_total}€</li>`;
      }
      html_content += "</ul>";

      // On affiche le prix total global
      html_content += `<p>Prix total : ${PRIX_TOTAL}€</p>`;

      if (panier.length == 0) {
        html_content = "<h3 style='margin-left: 20px;'>Panier vide</h3>";
      }
      document.getElementById("panier").innerHTML = html_content;
      return true;
    });
}




//fonction qui ajoute les produits au panier
function ajouter_panier()
{

    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var id = urlParams.get('id');

    var taille = document.getElementById("taille").value;
    var collab = document.getElementById("collab").value;
    var quantité = document.getElementById("quantite").value;

    /* localstorage['panier'] contient des données json sous forme d'une liste d'element ci-dessous */
    content = {"modele_id":id,"modele_collab":collab,"modele_taille":taille,"quantité":quantité,};

    panier = JSON.parse(localStorage.getItem("panier"));
    if (!(panier) | panier == "")
    {
        panier = [];
    }
    console.log(panier);
    panier.push(content);
    console.log(panier);
    localStorage.setItem("panier", JSON.stringify(panier));
    document.location.reload();
}


//fonction qui supprime tout les éléments du panier
function effacer_panier() {
    localStorage.setItem("panier",JSON.stringify([]));
    document.location.reload();
}



// permet de trier les produits par prix croissant ou décroissant
document.addEventListener("DOMContentLoaded", function(event) { 
    const productGrid = document.getElementById('productGrid');
    const sortAsc = document.getElementById('sortAsc');
    const sortDesc = document.getElementById('sortDesc');

    function sortByPrice(products, sortOrder) {
      products.sort(function(a, b) {
        const priceA = parseInt(a.querySelector('p').textContent.split(' ')[2]);
        const priceB = parseInt(b.querySelector('p').textContent.split(' ')[2]);
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      });
      return products;
    }

    function renderProducts(products) {
      productGrid.innerHTML = '';
      products.forEach(function(product) {
        productGrid.appendChild(product);
      });
    }

    sortAsc.addEventListener('change', function() {
        if(sortAsc.checked) {
            sortDesc.checked = false;
          const products = Array.from(productGrid.querySelectorAll('.product'));
          const sortedProducts = sortByPrice(products, 'asc');
          renderProducts(sortedProducts);
        }
    });

    sortDesc.addEventListener('change', function() {
        if(sortDesc.checked) {
            sortAsc.checked = false;
          const products = Array.from(productGrid.querySelectorAll('.product'));
          const sortedProducts = sortByPrice(products, 'desc');
          renderProducts(sortedProducts);
        }
    });
});