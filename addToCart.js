document.addEventListener("DOMContentLoaded", function () {
    const cartList = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    const cartCount = document.querySelector("#cart-item-count");
    const cartCountLink = document.querySelector(".cart-count");  // Elemento do número de itens no carrinho
    const addToCartButtons = document.querySelectorAll(".add-to-cart");

    // Limpar o carrinho do localStorage assim que a página for carregada
    localStorage.removeItem("cart");

    // Recarregar o carrinho (ele estará vazio pois foi limpo acima)
    let cart = [];

    // Função para atualizar o carrinho
    function updateCart() {
        cartList.innerHTML = "";
        let total = 0;

        // Adiciona os itens do carrinho à lista
        cart.forEach((item, index) => {
            if (typeof item.price === "number" && !isNaN(item.price)) {
                const li = document.createElement("li");
                li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
                li.innerHTML = `
                    <span>${item.name} - $${item.price.toFixed(2)}</span>
                    <button class="btn btn-sm btn-danger remove-item" data-index="${index}">X</button>
                `;

                // Adiciona o item à lista do carrinho
                cartList.appendChild(li);
                total += item.price;
            } else {
                console.error("Preço inválido encontrado:", item.price);
            }
        });

        // Atualiza o total
        totalElement.textContent = `$${total.toFixed(2)}`;

        // Atualiza o número de itens no carrinho
        cartCount.textContent = `(${cart.length})`;
        if (cartCountLink) {
            cartCountLink.textContent = `(${cart.length})`;  // Atualiza a contagem no link do carrinho
        }

        // Salva o carrinho atualizado no localStorage
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // Função para adicionar itens ao carrinho
    addToCartButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            const name = button.getAttribute("data-name");
            const priceString = button.getAttribute("data-price");

            // Log de debug para verificar o valor de data-price
            console.log(`Valor de data-price para "${name}":`, priceString);

            if (!priceString || priceString.trim() === "") {
                console.error(`Preço inválido para o item "${name}". O valor de data-price está ausente ou vazio.`);
                return;
            }

            const price = parseFloat(priceString);

            if (isNaN(price)) {
                console.error(`Preço inválido para o item "${name}". Valor recebido: ${priceString}`);
                return;
            }

            // Adiciona o item ao carrinho
            cart.push({ name, price });
            updateCart();
        });
    });

    // Função para remover um item do carrinho
    cartList.addEventListener("click", (event) => {
        if (event.target && event.target.classList.contains("remove-item")) {
            const index = event.target.getAttribute("data-index");
            removeFromCart(index);
        }
    });

    // Função para remover o item do carrinho
    function removeFromCart(index) {
        cart.splice(index, 1);  // Remove o item pelo índice
        updateCart();  // Atualiza a lista e o total
    }

    // Atualiza o carrinho inicial
    updateCart();
});
