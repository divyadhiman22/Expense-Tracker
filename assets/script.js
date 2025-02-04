document.addEventListener("DOMContentLoaded", function () {
    const joinUsBtn = document.getElementById("join-us-btn");
    const modal = document.getElementById("modal");
    const closeBtn = document.getElementById("close-btn");

    // Show modal when "Join Us" is clicked
    joinUsBtn.addEventListener("click", function () {
        modal.classList.remove("hidden");
    });

    // Hide modal when "X" button is clicked
    closeBtn.addEventListener("click", function () {
        modal.classList.add("hidden");
    });

    // Hide modal when clicking outside of the modal content
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.classList.add("hidden");
        }
    });
});



// 
document.addEventListener("DOMContentLoaded", function() {
    const sortButton = document.getElementById("sort-by");
    const sortDropdown = document.getElementById("sort-dropdown");
    const sortOptions = sortDropdown.querySelectorAll("li");

    // Toggle dropdown on button click
    sortButton.addEventListener("click", function(event) {
        event.stopPropagation(); // Prevents immediate closing
        sortDropdown.classList.toggle("hidden");
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", function(event) {
        if (!sortDropdown.contains(event.target) && event.target !== sortButton) {
            sortDropdown.classList.add("hidden");
        }
    });

    // Handle sorting options
    sortOptions.forEach(option => {
        option.addEventListener("click", function() {
            const sortType = this.getAttribute("data-sort");
            console.log("Sorting by:", sortType);
            sortDropdown.classList.add("hidden");
            // Call your sorting function here based on sortType
        });
    });
});


const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuCloseBtn = document.getElementById('mobile-menu-close');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        const mobileModeJoinUsButtons = [
            document.getElementById('mobile-join-us-btn'),
            document.getElementById('mobile-hero-join-us-btn')
        ];

        // Open mobile menu
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('mobile-nav-hidden');
        });

        // Close mobile menu
        mobileMenuCloseBtn.addEventListener('click', () => {
            mobileMenu.classList.add('mobile-nav-hidden');
        });

        // Close mobile menu when a nav link is clicked
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('mobile-nav-hidden');
            });
        });

        // Trigger modal from mobile menu
        mobileModeJoinUsButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = document.getElementById('modal');
                modal.classList.remove('hidden');
                mobileMenu.classList.add('mobile-nav-hidden');
            });
        });



 
