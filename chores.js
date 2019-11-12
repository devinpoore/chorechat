const chores = [
    {
        id: 0,
        key: "BATHROOM",
        duties: [
            "1: Use bleach spray to clean toilet bowl, rim, and exterior",
            "2: Use bleach spray to wipe down sink, counter, and shower",
            "3: Use glass cleaner to clean mirror",
            "4: Refill hand soap",
            "5: Take out bathroom garbage if full"
        ],
        supplyNotes: [
            "Glass cleaner, bathroom garbage bags, and hand soap refill are stored under the bathroom sink"
        ]
    },
    {
        id: 1,
        key: "KITCHEN",
        duties: [
            "1: Use bleach spray to wipe down sink, counters, and stove top",
            "2: Wipe down kitchen appliances (toaster, coffee maker, microwave)",
            "3: Sweep kitchen floor",
            "4: Empty crumbs from toaster tray",
            "5: Refill dish soap"
        ],
        supplyNotes: [
            "Bleach spray and dish soap refill are stored under the kitchen sink"
        ]
    },
    {
        id: 2,
        key: "GARBAGE/LAUNDRY",
        duties: [
            "1: Take out the trash and recylce whenever full throughout the week",
            "2: Collect bathroom and kitchen hand towels and launder them"
        ],
        supplyNotes: []
    },
    {
        id: 3,
        key: "LIVING ROOM",
        duties: [
            "1: Vacuum upstairs and empty vacuum cleaner when finished",
            "2: Wipe down dining table and coffee tables as needed",
            "3: Collect and throw away any random trash in the common areas"
        ],
        supplyNotes: [
            "Vacuum cleaner is located downstairs behind the furnace"
        ]
    }
    // trashCollection: {
    //     id: 5,
    //     key: "Weekly Trash Collection",
    //     duties: [
    //         "Make sure the appropriate bins are put outside for collection"
    //     ],
    //     supplyNotes: [
    //         "Check the fridge pickup schedule for recycling days"
    //     ]
    // }
]

module.exports = chores;