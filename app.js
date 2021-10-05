$(document).ready(() => {
  // BARRA DE BUSQUEDA
  function Searcher() {
    let topDiv = document.createElement("div");
    let searchBar = '<input placeholder="Ingrese articulo a buscar.." class="searchInput" name="inputBar" /><button class="searchButton" value="inputBat">Buscar</button>';
    $(topDiv).html(searchBar).addClass('search_bar');
    $('#root').append(topDiv);
    buttonFunction('searchButton');
  }

  // FUNCION CLICK DEL BOTON DE LA BARRA DE BUSQUEDA
  function buttonFunction(btn) {
    $(`.${btn}`).on('click', (e) => {
      if (e.target.previousSibling.value == '') {
        alert('Ingrese un articulo a buscar.')
      } else {
        SearchItem(e.target.previousSibling.value);
        if ($('#priceOrder').is(':checked')) {
          $('#priceOrder').prop('checked', false);
        }
      }
    });
  }

  // LLAMADA A LA API LUEGO DEL CLICK DE BUSQUEDA
  function SearchItem(item, filtro = false) {
    let searchUrl = 'https://api.mercadolibre.com/sites/MLA/search?q=';
    $.get(`${searchUrl}${item}&limit=10`, (data, status) => {
      if (status == 'success') {
        if (filtro) {
          addItems(data.results.filter((element) => element.shipping.free_shipping == true));
        }
        setItemToSearch(data.results);
        addItems(data.results);
        $('.filter').show();
        $('.shopCart').show();
      } else {
        error('Algo inesperado ha ocurrido.');
      }
    });
  }

  // ARMADO SECCIONES DE LA VISTA
  function pageSections() {
    let filter = document.createElement("div");
    let main = document.createElement("div");
    let shopCart = document.createElement("div");
    let mainBody = document.createElement("div");
    $(filter).addClass('filter').hide();
    $(main).addClass('main');
    $(shopCart).addClass('shopCart').hide();
    $(mainBody).append(filter, main, shopCart).addClass('main-container');
    $('#root').append(mainBody);
    filterBuild();
    sideCartBuild();

  }

  // SIDE CART
  function sideCartBuild() {
    let cart = document.createElement("div");
    let cartContent = '<h3>En el carrito: </h3>' +
                      '<table class="table_cart"><tr><th>Articulo</th><th>Precio</th></tr>' +
                      '</table><h3 class="total_cart"></h3><button class="buy_carrito">Comprar</button>';
    $(cart).html(cartContent).addClass('carrito_temp');
    $('.shopCart').append(cart);
  }

  // ARMADO FILTRO
  function filterBuild() {
    let filtros = document.createElement("div");
    let filtro = '<h3>Filtros de busqueda: </h3><div class="filtro_shipp"><label for="freeShipp">Free Shipping </label>' +
      '<input id="freeShipp" name="freeShipp" value="yes" type="checkbox" /> </div>' +
      '<div class="filtro_price"> <label for="priceOrder">Ordenar por precio </label>' +
      '<input id="priceOrder" name="priceOrder" value="yes" type="checkbox" /> </div>';

    $(filtros).html(filtro).addClass('filtros');
    $('.filter').append(filtros);
    $('#freeShipp').on('click', () => { filterShipp() });
    $('#priceOrder').on('click', () => { filterPrice() });
  }

  // LLAMADO FILTRO SHIPPING
  function filterShipp() {
    $('.items-container').children().remove();
    console.log(itemToSearch);
    let filteredItems = itemToSearch.filter((element) => element.shipping.free_shipping == false);
    console.log(filteredItems);
    if ($('#freeShipp').is(':checked')) {
      addItems(filteredItems);
    } else {
      addItems(itemToSearch);
    }
  }

  // LLAMADO FILTRO PRECIO
  function filterPrice() {
    $('.items-container').children().remove();
    let filteredItems = itemToSearch.sort((a, b) => {
      if (parseFloat(a.price) < parseFloat(b.price)) return -1;
      if (parseFloat(a.price) > parseFloat(b.price)) return 1;
      return 0;
    });
    if ($('#priceOrder').is(':checked')) {
      addItems(filteredItems);
    } else {
      addItems(itemToSearch);
    }
    ;
  }

  // ARMADO ASIDE CARRRITO


  // AGREGA EL LISTADO DE ITEMS A LA VISTA
  function addItems(items) {
    console.log(items);
    let searchImg = 'https://api.mercadolibre.com/items/';
    let itemsDiv = document.createElement("div");
    for (let i = 0; i < items.length; i++) {
      $.get(`${searchImg}${items[i].id}`, (data, status) => {
        if (status == 'success') {
          let itemDiv = document.createElement("div");
          let itemCard = `<div class="item-detail"><div class="item_img"><img src="${data.pictures[0].url}" /></div><div class="item_info"><a href="#"><h2>${items[i].title}</h2></a><h3>$${items[i].price}</h3></div><div class="item_cesta"><a class="item_carrito" href="#">Aniadir a la cesta</a></div><div/>`
          $(itemDiv).html(itemCard).addClass('itemsDiv');
          $(itemsDiv).append(itemDiv);
        }
      });
    }

    if ($('.items-container').length) {
      $('.items-container').remove();
    }
    $(itemsDiv).addClass('items-container');
    $('.main').append(itemsDiv);
    buttonCart();
  }

  // BOTON CARRITO FUNCION
  function buttonCart() {
    $(document).unbind().on('click', '.item_carrito', (e) => {
      let title = e.currentTarget.parentNode.previousSibling.firstChild.innerText;
      let price = e.currentTarget.parentNode.previousSibling.lastChild.innerText;
      let newTr = document.createElement("tr");
      let newTd1 = document.createElement("td");
      let newTd2 = document.createElement("td");
      $(newTd1).text(title);
      $(newTd2).text(price).addClass('td_value');
      $(newTr).append(newTd1, newTd2); 
      $('.table_cart').find('tbody').append(newTr);
      infoCart();
      finishBuy();
     });
  }

  // FINALIZA COMPRA
  function finishBuy() {
    $('.buy_carrito').unbind().on('click', () => {
      $('.carrito_temp').animate({"position": "absolute", "z-index": "9999", "left":"400px", "width":"600", "height":"600", "background-color": "rgba(255, 255, 255, .9)"}, 2000).animate({"padding-top": "170"}, 2000);
      $('.buy_carrito').hide();
      let msg = 'Gracias por su compra!';
      let msgElement = document.createElement("h2");
      $(msgElement).html(msg).addClass('compra');
      $('.carrito_temp').append(msgElement);
    });
  }

  // CARRITO INFO
  function infoCart() {
    let total = 0;
    let table = document.getElementsByClassName('td_value');
    for (let i = 0; i < table.length; i++) {
      let val = table[i].innerText;
      let insertVal = val.slice(1);
      total += parseFloat(insertVal);
    }
    $('.total_cart').text(`Total: $${Math.round(total)}`);
  }

  Searcher();
  pageSections();
  let itemToSearch;
  const setItemToSearch = (value) => { itemToSearch = value; }
});