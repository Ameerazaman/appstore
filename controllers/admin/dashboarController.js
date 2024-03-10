const Order = require("../../models/user/ordermodel");
const Users = require("../../models/user/usermodel");



// getDashboard
const getDashboard = async (req, res) => {
    try {
        // *************Find total revenue and total price***************
        const nonCanceledOrders = await Order.find({ status: { $ne: 'Canceled' } });

        // Calculate total price
        let totalPrice = 0;
        nonCanceledOrders.forEach(order => {
            totalPrice += order.totalPrice;
        });

        console.log('Total price of non-canceled orders:', totalPrice);
        ////////////////////////////////////
        // *************************find total sales****************
        const totalProductsCount = await Order.aggregate([
            {
                $match: { status: { $ne: "Canceled" } } // Match orders with status not equal to "Canceled"
            },
            {
                $project: {
                    productsCount: {
                        $size: {
                            $filter: {
                                input: "$products",
                                as: "product",
                                cond: { $ne: ["$$product.status", "Canceled"] } // Exclude products with status "Canceled"
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalProductsCount: { $sum: "$productsCount" } // Sum up the products count for all orders
                }
            },
            {
                $project: {
                    totalProductsCount: 1
                }
            }
        ]);
        const totalSales = totalProductsCount[0].totalProductsCount
        console.log("total sales", totalSales)
        // totalProductsCount.length > 0 ? totalProductsCount[0].totalProductsCount : 0;

        // *******************count Total users**************
        const totalUsers = await Users.countDocuments({});
        console.log("totalUsers", totalUsers)

        req.session.Users=totalUsers
        req.session.totalPrice=totalPrice
        req.session.totalSales=totalSales

        
        res.render('admin/dashboard', { admin: true, totalUsers, totalPrice, totalSales });

    }


    catch (error) {
        console.error('Error calculating total price:', error);
    }
}


// get monthly sales
const monthlySales = async (req, res) => {
    //  Monthly sales
    try {
        
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Aggregate to find monthly sales excluding canceled and returned orders
        console.log("monthly sales")
        const monthlySales = await Order.aggregate([
            {
                $match: {
                    
                    orderedAt: {
                        $gte: startDate.toISOString(),
                        $lte: endDate.toISOString()
                    },
                    status: { $nin: ['Canceled', 'Return'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$total' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        if (monthlySales.length > 0) {
            console.log('Monthly sales (excluding canceled and returned orders):');
            console.log('Total Sales:', monthlySales[0].totalSales);
            console.log('Total Orders:', monthlySales[0].totalOrders);
        } else {
            console.log('No sales data found for the current month.');
        }
        const totalUsers=req.session.Users
        const totalPrice=req.session.totalPrice
        const totalSales= req.session.totalSales
        res.render("admin/dashboard",{monthlySales,totalPrice,totalUsers,totalSales})
    }
    catch (error) {
        console.log("Error in monthly sales dashboard control route ")
    }
}
module.exports = { getDashboard,monthlySales }
// const currentDate = new Date();

//         // Calculate the start and end dates of the current week
//         const startDateWeek = new Date(currentDate);
//         startDateWeek.setHours(0, 0, 0, 0);
//         startDateWeek.setDate(startDateWeek.getDate() - startDateWeek.getDay()); // Start of the week (Sunday)
//         const endDateweek = new Date(startDateWeek);
//         endDateweek.setDate(endDateweek.getDate() + 7); // End of the week (next Sunday)

//         // Aggregate to find weekly sales excluding canceled orders
//         const weeklySales = await Order.aggregate([
//             {
//                 $match: {
//                     orderedAt: {
//                         $gte: startDateWeek.toISOString(),
//                         $lt: endDateweek.toISOString()
//                     },
//                     status: { $ne: 'Canceled' }
//                 }
//             },
//             {
//                 $group: {
//                     _id: null,
//                     totalSales: { $sum: '$total' },
//                     totalOrders: { $sum: 1 }
//                 }
//             }
//         ]);

//         if (weeklySales.length > 0) {
//             console.log('Weekly sales (excluding canceled orders):');
//             console.log('Total Sales:', weeklySales[0].totalSales);
//             console.log('Total Orders:', weeklySales[0].totalOrders);
//         } else {
//             console.log('No sales data found for the current week.');
//         }
//         