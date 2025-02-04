// service layer - logic for crud operations

import Transaction from "../models/transaction.js";

  const transactionOperations ={
    flag:true,
    transactions:[],
    barChartInstance: null,
    pieChartInstance: null,
    getAllTransactions(){
        return this.transactions;
    },
    initializeCharts() {
        this.initializeBarChart();
        this.initializePieChart();
    },
    initializeBarChart() {
        const barCtx = document.getElementById('transactionBarChart')?.getContext('2d');
        if (!barCtx) return;

        // Destroy existing bar chart if it exists
        if (this.barChartInstance) {
            this.barChartInstance.destroy();
        }

        // Group transactions by category
        const groupedData = this.transactions.reduce((acc, transaction) => {
            if (!acc[transaction.category]) {
                acc[transaction.category] = 0;
            }
            acc[transaction.category] += parseFloat(transaction.amount);
            return acc;
        }, {});

        // Prepare chart data
        const labels = Object.keys(groupedData);
        const values = Object.values(groupedData);

        // Create new bar chart
        this.barChartInstance = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Transaction Amount',
                    data: values,
                    backgroundColor: values.map(value => 
                        value >= 0 ? 'rgb(75, 192, 192)' : 'rgba(255, 99, 133, 0.96)'
                    ),
                    borderColor: values.map(value => 
                        value >= 0 ? 'rgb(44, 167, 167)' : 'rgba(255, 99, 132, 1)'
                    ),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Transaction Summary'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'INR'
                                }).format(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'INR',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    },

    initializePieChart() {
        const pieCtx = document.getElementById('transactionPieChart')?.getContext('2d');
        if (!pieCtx) return;
    
        // Destroy existing pie chart if it exists
        if (this.pieChartInstance) {
            this.pieChartInstance.destroy();
        }
    
        // Group transactions by category
        const groupedData = this.transactions.reduce((acc, transaction) => {
            if (!acc[transaction.category]) {
                acc[transaction.category] = 0;
            }
            acc[transaction.category] += parseFloat(transaction.amount);
            return acc;
        }, {});
    
        // Prepare chart data
        const labels = Object.keys(groupedData);
        const values = Object.values(groupedData);
    
        const backgroundColors = [
            'rgba(234, 59, 97, 0.93)',
            'rgb(72, 166, 228)',
            'rgb(255, 207, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',
            'rgb(255, 160, 64)'
        ];
    
        const borderColors = backgroundColors.map(color => 
            color.replace('0.6', '1')
        );
    
        // Create new pie chart
        this.pieChartInstance = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values.map(Math.abs),
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderColor: borderColors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.7,
                plugins: {
                    legend: {
                        position: window.innerWidth < 768 ? 'bottom' : 'right',
                        labels: {
                            padding: 10,
                            font: {
                                size: window.innerWidth < 768 ? 10 : 11
                            },
                            boxWidth: window.innerWidth < 768 ? 12 : 15
                        }
                    },
                    title: {
                        display: true,
                        text: 'Transaction Distribution',
                        padding: {
                            top: 5,
                            bottom: 5
                        },
                        font: {
                            size: window.innerWidth < 768 ? 12 : 14
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'INR'
                                }).format(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    
        // Add resize handler
        window.addEventListener('resize', () => {
            if (this.pieChartInstance) {
                this.pieChartInstance.options.plugins.legend.position = window.innerWidth < 768 ? 'bottom' : 'right';
                this.pieChartInstance.options.plugins.legend.labels.font.size = window.innerWidth < 768 ? 10 : 11;
                this.pieChartInstance.options.plugins.legend.labels.boxWidth = window.innerWidth < 768 ? 12 : 15;
                this.pieChartInstance.options.plugins.title.font.size = window.innerWidth < 768 ? 12 : 14;
                this.pieChartInstance.update();
            }
        });
    },

    add(transObject) {
        const transaction = new Transaction();
        for(let key in transObject) {
            transaction[key] = transObject[key];
        }
        this.transactions.push(transaction);
        this.initializeCharts();
        
        return transaction;
    },

    remove() {
        this.transactions = this.transactions.filter(transactionObject => !transactionObject.isDeleted);
        
        if (localStorage) {
            const obj = { "transactions-data": this.transactions };
            localStorage.setItem('transactions', JSON.stringify(obj));
        }
        
        // Update both charts
        this.initializeCharts();
        
        return this.transactions;
    },


    getTransactionCount(){
        return this.transactions.length;
    },
  
    search(transactionId){
       return this.transactions.find((transactionObject)=>transactionObject.id == transactionId)
    },

    loadFromStorage() {
        const storedData = localStorage.getItem('transactions');
        if (storedData) {
            const { 'transactions-data': transactions } = JSON.parse(storedData);
            this.transactions = transactions.map(transData => {
                const transaction = new Transaction();
                for(let key in transData) {
                    transaction[key] = transData[key];
                }
                return transaction;
            });
            
            // Initialize both charts with loaded data
            this.initializeCharts();
        }
    },

    toggleMark(transactionId){
       const transObject = this.search(transactionId);
       if(transObject){
        transObject.toggleMark();
       }

    },
    countMarked(){
       return this.transactions.filter(transObject => transObject.isDeleted).length;//transactions me se transaction object niklega
    },
    countUnmarked(){
       return this.transactions.length - this.countMarked();
    },
    sort(key) {
        if (key === "desc") {
            this.transactions.sort((a, b) =>
                this.flag ? a.desc.localeCompare(b.desc) : b.desc.localeCompare(a.desc)
            );
        } else if (key === "amount") {
            this.transactions.sort((a, b) =>
                this.flag ? a.amount - b.amount : b.amount - a.amount
            );
        } else if (key === "date") {
            this.transactions.sort((a, b) =>
                this.flag ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)
            );
        }

        this.flag = !this.flag; // Toggle sorting order for next time
        return this.transactions;
    },

}
export default transactionOperations;