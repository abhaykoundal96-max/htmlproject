/**
 * SwiftDrop Express - Courier Pickup & Delivery Management System
 * Course: CSE326 - Internet Programming (Units I to IV)
 * Section: K3P26YK | Group: 20
 * 
 * Group Members:
 * 1. Abhay Koundal (Leader, Reg: 12615252) -> Features 1, 2, 3
 * 2. Harshit Choudhary (Member 2, Reg: 12615992) -> Features 4, 5, 6
 * 3. Anant Dwivedi (Member 3, Reg: 12628361) -> Features 7, 8, 9
 * 
 * STRICT CONSTRAINT SATISFIED: ZERO <div> TAGS USED.
 */

"use strict";

// =============================================================================
// GLOBAL CONFIGURATION & DATA REPOSITORY (Units 2, 3 & 4)
// =============================================================================
const STORAGE_KEY = "swift_drop_shipments_db";
const BASE_RATE = 50.00;       // Base booking fee in INR
const PER_KG_RATE = 20.00;     // Price per kg in INR
const FRAGILE_CHARGE = 35.00;  // Extra handling fee for fragile items
const GST_PERCENTAGE = 18;     // Standard Logistics GST %

// In-Memory Shipments Array (Persisted with localStorage)
let shipments = [];

// Seed Initial Sample Shipments if storage is empty
const seedInitialData = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      shipments = JSON.parse(existing);
      return;
    } catch (e) {
      console.warn("Storage reset due to corrupted JSON.", e);
    }
  }

  // Pre-loaded seed shipments showcasing all stages
  shipments = [
    {
      id: "CPD-2026-1001",
      customer: {
        name: "Aman Verma",
        email: "aman.verma@lpu.in",
        phone: "9876543210",
        type: "Student"
      },
      pickup: {
        address: "BH-4, Room 302, LPU Campus",
        city: "Phagwara",
        date: "2026-11-16",
        slot: "Morning (09:00 AM - 12:00 PM)"
      },
      parcel: {
        deliveryAddress: "H.No 45, Model Town, Jalandhar, Punjab",
        category: "Documents",
        weight: 1.5,
        isFragile: false,
        notes: "Deliver before 5 PM",
        fee: 80.24
      },
      assignment: {
        driver: "Ramesh Kumar (Bike - PB08-1122)",
        priority: "Express"
      },
      status: "In Transit",
      checkpoints: [
        { status: "Order Booked", location: "LPU Main Gate Hub", time: "16-Nov-2026 09:30 AM" },
        { status: "Picked Up", location: "BH-4 Hostel Desk", time: "16-Nov-2026 11:15 AM" },
        { status: "In Transit", location: "Jalandhar Sorting Facility", time: "16-Nov-2026 02:45 PM" }
      ],
      deliveryDetails: null
    },
    {
      id: "CPD-2026-1002",
      customer: {
        name: "Priya Sharma",
        email: "priya.s@gmail.com",
        phone: "9812345678",
        type: "Regular"
      },
      pickup: {
        address: "Flat 12B, Green Valley Apts",
        city: "Phagwara",
        date: "2026-11-15",
        slot: "Afternoon (12:00 PM - 04:00 PM)"
      },
      parcel: {
        deliveryAddress: "Sector 22-B, Chandigarh",
        category: "Electronics",
        weight: 3.2,
        isFragile: true,
        notes: "Handle with extreme care",
        fee: 175.82
      },
      assignment: {
        driver: "Gurpreet Singh (Van - PB08-4455)",
        priority: "Standard"
      },
      status: "Delivered",
      checkpoints: [
        { status: "Order Booked", location: "Phagwara Central Hub", time: "15-Nov-2026 10:00 AM" },
        { status: "Picked Up", location: "Green Valley Apts", time: "15-Nov-2026 01:20 PM" },
        { status: "In Transit", location: "Ludhiana Transshipment Center", time: "15-Nov-2026 06:10 PM" },
        { status: "Out for Delivery", location: "Chandigarh Hub", time: "16-Nov-2026 08:30 AM" },
        { status: "Delivered", location: "Recipient Doorstep", time: "16-Nov-2026 12:40 PM" }
      ],
      deliveryDetails: {
        receivedBy: "Rohit Sharma (Brother)",
        remarks: "Package received safely with seal intact",
        completedAt: "16-Nov-2026 12:40 PM"
      }
    }
  ];

  saveShipmentsToStorage();
};

const saveShipmentsToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
};

// =============================================================================
// =============================================================================
// PART 1: ASSIGNED TO ABHAY KOUNDAL (LEADER - REG: 12615252)
// Features: 1. Customer registration | 2. Pickup request | 3. Parcel details
// =============================================================================
// =============================================================================

// Helper: Calculate Shipping Charge (Operators, Numbers & Math)
const calculateShippingCost = (weight, category, isFragile, customerType) => {
  const parsedWeight = Number(weight);
  let basePrice = BASE_RATE + (parsedWeight * PER_KG_RATE);

  // Category Surcharges
  if (category === "Electronics") {
    basePrice += 30;
  } else if (category === "Medicine") {
    basePrice += 15;
  }

  // Fragile Care Fee
  if (isFragile) {
    basePrice += FRAGILE_CHARGE;
  }

  // Customer Type Discount
  let discount = 0;
  if (customerType === "Student") {
    discount = basePrice * 0.10; // 10% off
  } else if (customerType === "Corporate") {
    discount = basePrice * 0.05; // 5% off
  }

  const discountedAmount = basePrice - discount;
  const gstAmount = (discountedAmount * GST_PERCENTAGE) / 100;
  const finalTotal = discountedAmount + gstAmount;

  // Return formatted object with 2 decimal precision (toFixed)
  return {
    basePrice: Number(basePrice.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    gst: Number(gstAmount.toFixed(2)),
    total: Number(finalTotal.toFixed(2))
  };
};

// Live Fee Preview Event Listener
const updateLivePricePreview = () => {
  const weightInput = document.getElementById("parcel-weight");
  const categoryInput = document.getElementById("parcel-category");
  const fragileInput = document.getElementById("is-fragile");
  const typeInput = document.getElementById("cust-type");
  const priceDisplay = document.getElementById("estimated-price");

  if (!weightInput || !priceDisplay) return;

  const weight = Number(weightInput.value) > 0 ? Number(weightInput.value) : 1;
  const category = categoryInput ? categoryInput.value : "Documents";
  const isFragile = fragileInput ? fragileInput.checked : false;
  const customerType = typeInput ? typeInput.value : "Regular";

  const quote = calculateShippingCost(weight, category, isFragile, customerType);
  priceDisplay.textContent = `₹ ${quote.total.toFixed(2)}`;
};

// Validation Function for Customer & Parcel Form
const validateBookingData = (data) => {
  // Check empty strings
  if (!data.name || data.name.trim().length < 3) {
    return { isValid: false, message: "Error: Customer Name must have at least 3 characters." };
  }

  // Email format check
  const atIdx = data.email.indexOf("@");
  const dotIdx = data.email.lastIndexOf(".");
  if (atIdx <= 0 || dotIdx <= atIdx + 1 || data.email.includes(" ")) {
    return { isValid: false, message: "Error: Please enter a valid Email address (e.g. user@domain.com)." };
  }

  // 10-digit Indian Mobile check
  const cleanPhone = data.phone.trim();
  if (cleanPhone.length !== 10 || Number.isNaN(Number(cleanPhone))) {
    return { isValid: false, message: "Error: Mobile Number must be an exact 10-digit numeric value." };
  }

  // Pickup and Delivery addresses
  if (!data.pickupAddress || data.pickupAddress.trim().length < 5) {
    return { isValid: false, message: "Error: Complete pickup street address is required." };
  }

  if (!data.deliveryAddress || data.deliveryAddress.trim().length < 5) {
    return { isValid: false, message: "Error: Complete delivery address is required." };
  }

  if (!data.pickupDate) {
    return { isValid: false, message: "Error: Please pick a scheduled pickup date." };
  }

  return { isValid: true, message: "All inputs are valid!" };
};

// Booking Form Submit Handler (Abhay Koundal)
const handleBookingSubmission = (event) => {
  event.preventDefault();

  const nameVal = document.getElementById("cust-name").value;
  const emailVal = document.getElementById("cust-email").value;
  const phoneVal = document.getElementById("cust-phone").value;
  const custTypeVal = document.getElementById("cust-type").value;

  const pickupAddrVal = document.getElementById("pickup-address").value;
  const pickupCityVal = document.getElementById("pickup-city").value;
  const pickupDateVal = document.getElementById("pickup-date").value;
  const pickupSlotVal = document.getElementById("pickup-slot").value;

  const deliveryAddrVal = document.getElementById("delivery-address").value;
  const categoryVal = document.getElementById("parcel-category").value;
  const weightVal = Number(document.getElementById("parcel-weight").value);
  const isFragileVal = document.getElementById("is-fragile").checked;
  const notesVal = document.getElementById("special-notes").value;
  const outputMsg = document.getElementById("booking-msg");

  const formData = {
    name: nameVal,
    email: emailVal,
    phone: phoneVal,
    pickupAddress: pickupAddrVal,
    deliveryAddress: deliveryAddrVal,
    pickupDate: pickupDateVal
  };

  const validation = validateBookingData(formData);
  if (!validation.isValid) {
    outputMsg.textContent = validation.message;
    outputMsg.className = "feedback-msg show-error";
    return;
  }

  // Calculate pricing breakdown
  const quote = calculateShippingCost(weightVal, categoryVal, isFragileVal, custTypeVal);

  // Invoke Module 2 ID Generator (Harshit's functionality)
  const newShipmentId = generateShipmentId();

  // Create Shipment Object (Unit 4: Object Literal)
  const newShipment = {
    id: newShipmentId,
    customer: {
      name: nameVal.trim(),
      email: emailVal.trim().toLowerCase(),
      phone: phoneVal.trim(),
      type: custTypeVal
    },
    pickup: {
      address: pickupAddrVal.trim(),
      city: pickupCityVal.trim(),
      date: pickupDateVal,
      slot: pickupSlotVal
    },
    parcel: {
      deliveryAddress: deliveryAddrVal.trim(),
      category: categoryVal,
      weight: weightVal,
      isFragile: isFragileVal,
      notes: notesVal.trim() || "None",
      fee: quote.total
    },
    assignment: {
      driver: "Unassigned",
      priority: "Standard"
    },
    status: "Order Booked",
    checkpoints: [
      {
        status: "Order Booked",
        location: `${pickupCityVal} Central Booking Desk`,
        time: formatCurrentDateTime()
      }
    ],
    deliveryDetails: null
  };

  // Add to in-memory array and persist (Unit 4: Array methods)
  shipments.push(newShipment);
  saveShipmentsToStorage();

  // Update Module 2 & 3 UI
  displayGeneratedShipmentId(newShipmentId);
  populateShipmentSelectorDropdown();
  renderShipmentHistoryTable("ALL");

  // Show Success Message with Template Literal
  outputMsg.textContent = `Success! Pickup scheduled for ${newShipment.customer.name}. Tracking ID assigned: ${newShipmentId} (Total: ₹ ${newShipment.parcel.fee.toFixed(2)})`;
  outputMsg.className = "feedback-msg show-success";

  // Reset form inputs
  document.getElementById("booking-form").reset();
  updateLivePricePreview();
};

// =============================================================================
// =============================================================================
// PART 2: ASSIGNED TO HARSHIT CHOUDHARY (MEMBER 2 - REG: 12615992)
// Features: 4. Shipment ID | 5. Delivery assignment | 6. Status updates
// =============================================================================
// =============================================================================

// 4. Shipment ID Generator Function (String & Math methods)
const generateShipmentId = () => {
  // Math.floor(Math.random() * (max - min + 1)) + min
  const randomSerial = Math.floor(Math.random() * 9000) + 1000;
  const currentYear = new Date().getFullYear();
  return `CPD-${currentYear}-${randomSerial}`;
};

// Display the newly created Shipment ID in the Module 2 badge
const displayGeneratedShipmentId = (id) => {
  const badgeElement = document.getElementById("active-shipment-id");
  if (badgeElement) {
    badgeElement.textContent = id;
  }
};

// Populate the Shipment Selector Dropdown in Module 2
const populateShipmentSelectorDropdown = () => {
  const selector = document.getElementById("select-shipment");
  if (!selector) return;

  // Clear current options
  selector.innerHTML = "";

  if (shipments.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "-- No Shipments Available --";
    selector.appendChild(opt);
    return;
  }

  // Populate shipments
  for (let i = 0; i < shipments.length; i++) {
    const s = shipments[i];
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${s.id} - ${s.customer.name} [${s.status}]`;
    selector.appendChild(opt);
  }
};

// 5. Delivery Assignment Handler
const handleDriverAssignment = () => {
  const shipmentId = document.getElementById("select-shipment").value;
  const driver = document.getElementById("assign-driver").value;
  const priorityRadio = document.querySelector('input[name="deliveryPriority"]:checked');
  const priority = priorityRadio ? priorityRadio.value : "Standard";
  const dispatchMsg = document.getElementById("dispatch-msg");

  if (!shipmentId) {
    dispatchMsg.textContent = "Error: Please select a valid shipment first.";
    dispatchMsg.className = "feedback-msg show-error";
    return;
  }

  const shipment = shipments.find(item => item.id === shipmentId);
  if (!shipment) {
    dispatchMsg.textContent = `Error: Shipment ${shipmentId} not found.`;
    dispatchMsg.className = "feedback-msg show-error";
    return;
  }

  // Update object assignment properties
  shipment.assignment.driver = driver;
  shipment.assignment.priority = priority;

  // Add auto checkpoint note
  shipment.checkpoints.push({
    status: shipment.status,
    location: `Assigned to ${driver} (${priority} Priority)`,
    time: formatCurrentDateTime()
  });

  saveShipmentsToStorage();
  populateShipmentSelectorDropdown();
  renderShipmentHistoryTable("ALL");

  dispatchMsg.textContent = `Updated: ${shipment.id} assigned to ${driver} with ${priority} Priority.`;
  dispatchMsg.className = "feedback-msg show-success";
};

// 6. Real-Time Status Milestone Update Handler
const handleStatusUpdate = () => {
  const shipmentId = document.getElementById("select-shipment").value;
  const newStatus = document.getElementById("update-status-select").value;
  const remarksInput = document.getElementById("status-remarks");
  const remarks = remarksInput.value.trim() || "Status milestone reached";
  const dispatchMsg = document.getElementById("dispatch-msg");

  if (!shipmentId) {
    dispatchMsg.textContent = "Error: Select a shipment to update.";
    dispatchMsg.className = "feedback-msg show-error";
    return;
  }

  const shipment = shipments.find(item => item.id === shipmentId);
  if (!shipment) {
    dispatchMsg.textContent = "Error: Shipment not found.";
    dispatchMsg.className = "feedback-msg show-error";
    return;
  }

  // Switch statement for Milestone logging (Unit 4: Conditionals)
  let milestoneLocation = "";
  switch (newStatus) {
    case "Order Booked":
      milestoneLocation = "Central Dispatch Hub";
      break;
    case "Picked Up":
      milestoneLocation = `${shipment.pickup.city} - Driver Pickup Point`;
      break;
    case "In Transit":
      milestoneLocation = remarks || "Regional Sorting & Transshipment Facility";
      break;
    case "Out for Delivery":
      milestoneLocation = `Local Delivery Van - ${shipment.assignment.driver}`;
      break;
    case "Delivered":
      milestoneLocation = "Destination Recipient Handover";
      if (!shipment.deliveryDetails) {
        shipment.deliveryDetails = {
          receivedBy: "Authorized Receiver",
          remarks: remarks,
          completedAt: formatCurrentDateTime()
        };
      }
      break;
    default:
      milestoneLocation = "Operations Checkpoint";
  }

  // Update state
  shipment.status = newStatus;
  shipment.checkpoints.push({
    status: newStatus,
    location: milestoneLocation,
    time: formatCurrentDateTime()
  });

  saveShipmentsToStorage();
  populateShipmentSelectorDropdown();
  renderShipmentHistoryTable("ALL");

  // If currently being tracked in Module 3, refresh the timeline
  const activeTrackedId = document.getElementById("track-disp-id").textContent;
  if (activeTrackedId === shipment.id) {
    renderTrackingView(shipment);
  }

  remarksInput.value = "";
  dispatchMsg.textContent = `Status Updated: ${shipment.id} is now [${newStatus}].`;
  dispatchMsg.className = "feedback-msg show-success";
};

// =============================================================================
// =============================================================================
// PART 3: ASSIGNED TO ANANT DWIVEDI (MEMBER 3 - REG: 12628361)
// Features: 7. Tracking timeline | 8. Delivery confirmation | 9. Shipment history
// =============================================================================
// =============================================================================

// Helper: Mapping status to 1-based index (1 to 5)
const getStatusStageIndex = (status) => {
  switch (status) {
    case "Order Booked": return 1;
    case "Picked Up": return 2;
    case "In Transit": return 3;
    case "Out for Delivery": return 4;
    case "Delivered": return 5;
    default: return 1;
  }
};

// 7. Render Tracking Timeline & Checkpoints
const renderTrackingView = (shipment) => {
  document.getElementById("track-disp-id").textContent = shipment.id;
  document.getElementById("track-disp-customer").textContent = `${shipment.customer.name} (${shipment.customer.phone})`;
  document.getElementById("track-disp-dest").textContent = `${shipment.parcel.deliveryAddress}`;
  document.getElementById("track-disp-driver").textContent = shipment.assignment.driver;
  
  const statusMark = document.getElementById("track-disp-status");
  statusMark.textContent = shipment.status;

  const currentStageNum = getStatusStageIndex(shipment.status);

  // Update Stepper List items (5 items: step-1 to step-5)
  for (let i = 1; i <= 5; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    if (stepEl) {
      stepEl.classList.remove("step-completed", "step-active");
      if (i < currentStageNum) {
        stepEl.classList.add("step-completed");
      } else if (i === currentStageNum) {
        stepEl.classList.add("step-active");
      }
    }
  }

  // Populate Checkpoint History List (<dl>, <dt>, <dd> - Unit 1)
  const checkpointContainer = document.getElementById("checkpoint-logs");
  checkpointContainer.innerHTML = "";

  if (shipment.checkpoints.length === 0) {
    const dt = document.createElement("dt");
    dt.textContent = "No log records recorded.";
    checkpointContainer.appendChild(dt);
  } else {
    // Reverse loop to show newest logs on top
    for (let j = shipment.checkpoints.length - 1; j >= 0; j--) {
      const cp = shipment.checkpoints[j];
      const dt = document.createElement("dt");
      dt.textContent = `📍 ${cp.status} — ${cp.time}`;
      
      const dd = document.createElement("dd");
      dd.textContent = cp.location;

      checkpointContainer.appendChild(dt);
      checkpointContainer.appendChild(dd);
    }
  }
};

// 7. Track Shipment Button Click Handler
const handleTrackingLookup = () => {
  const queryInput = document.getElementById("tracking-search-input");
  const query = queryInput.value.trim().toUpperCase();

  if (!query) {
    alert("Please enter a Shipment ID to track.");
    return;
  }

  const found = shipments.find(s => s.id === query);
  if (!found) {
    alert(`No shipment found matching tracking ID: "${query}".`);
    return;
  }

  renderTrackingView(found);
};

// 8. Delivery Confirmation Handler
const handleDeliveryConfirmation = () => {
  const shipmentIdInput = document.getElementById("confirm-shipment-id");
  const recipientNameInput = document.getElementById("recipient-sign-name");
  const notesInput = document.getElementById("delivery-notes");
  const confirmMsg = document.getElementById("confirm-msg");

  const shipmentId = shipmentIdInput.value.trim().toUpperCase();
  const recipientName = recipientNameInput.value.trim();
  const notes = notesInput.value.trim() || "Signed and verified upon arrival";

  if (!shipmentId || !recipientName) {
    confirmMsg.textContent = "Error: Please provide both the Shipment ID and Recipient Name.";
    confirmMsg.className = "feedback-msg show-error";
    return;
  }

  const shipment = shipments.find(s => s.id === shipmentId);
  if (!shipment) {
    confirmMsg.textContent = `Error: Shipment ID "${shipmentId}" not found.`;
    confirmMsg.className = "feedback-msg show-error";
    return;
  }

  if (shipment.status === "Delivered") {
    confirmMsg.textContent = `Shipment ${shipment.id} has already been marked as Delivered previously.`;
    confirmMsg.className = "feedback-msg show-success";
    return;
  }

  // Finalize delivery status
  shipment.status = "Delivered";
  shipment.deliveryDetails = {
    receivedBy: recipientName,
    remarks: notes,
    completedAt: formatCurrentDateTime()
  };

  shipment.checkpoints.push({
    status: "Delivered",
    location: `Received by: ${recipientName} (${notes})`,
    time: formatCurrentDateTime()
  });

  saveShipmentsToStorage();
  populateShipmentSelectorDropdown();
  renderShipmentHistoryTable("ALL");

  // Refresh tracking card if this shipment is currently displayed
  const currentActiveTrackId = document.getElementById("track-disp-id").textContent;
  if (currentActiveTrackId === shipment.id) {
    renderTrackingView(shipment);
  }

  confirmMsg.textContent = `Success: Delivery confirmed for ${shipment.id}. Handed over to "${recipientName}".`;
  confirmMsg.className = "feedback-msg show-success";

  // Reset inputs
  shipmentIdInput.value = "";
  recipientNameInput.value = "";
  notesInput.value = "";
};

// 9. Shipment History Table Renderer (Unit 2: table, caption, thead, tbody, tfoot, colspan)
const renderShipmentHistoryTable = (filterStatus = "ALL") => {
  const tbody = document.getElementById("history-table-body");
  const tfoot = document.getElementById("history-table-foot");
  if (!tbody || !tfoot) return;

  tbody.innerHTML = "";
  tfoot.innerHTML = "";

  // Filter shipments based on selection
  let displayList = shipments;
  if (filterStatus !== "ALL") {
    displayList = shipments.filter(s => s.status === filterStatus);
  }

  if (displayList.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 8;
    emptyCell.style.textAlign = "center";
    emptyCell.style.padding = "1.5rem";
    emptyCell.textContent = "No shipment records found matching the selected filter.";
    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
  } else {
    let totalRevenue = 0;
    let deliveredCount = 0;

    for (let i = 0; i < displayList.length; i++) {
      const s = displayList[i];
      totalRevenue += s.parcel.fee;
      if (s.status === "Delivered") {
        deliveredCount++;
      }

      const row = document.createElement("tr");

      // Column 1: Shipment ID (Clickable to track)
      const tdId = document.createElement("td");
      const codeEl = document.createElement("code");
      codeEl.textContent = s.id;
      codeEl.style.cursor = "pointer";
      codeEl.title = "Click to Track";
      codeEl.onclick = () => {
        document.getElementById("tracking-search-input").value = s.id;
        handleTrackingLookup();
        window.location.hash = "#tracking-section";
      };
      tdId.appendChild(codeEl);
      row.appendChild(tdId);

      // Column 2: Customer Name
      const tdCustomer = document.createElement("td");
      tdCustomer.textContent = s.customer.name;
      row.appendChild(tdCustomer);

      // Column 3: Pickup City
      const tdCity = document.createElement("td");
      tdCity.textContent = s.pickup.city;
      row.appendChild(tdCity);

      // Column 4: Category
      const tdCategory = document.createElement("td");
      tdCategory.textContent = s.parcel.category;
      row.appendChild(tdCategory);

      // Column 5: Weight
      const tdWeight = document.createElement("td");
      tdWeight.textContent = `${s.parcel.weight} kg`;
      row.appendChild(tdWeight);

      // Column 6: Assigned Executive
      const tdDriver = document.createElement("td");
      tdDriver.textContent = s.assignment.driver;
      row.appendChild(tdDriver);

      // Column 7: Status Badge
      const tdStatus = document.createElement("td");
      const statusSpan = document.createElement("span");
      statusSpan.textContent = s.status;
      statusSpan.className = getStatusPillClass(s.status);
      tdStatus.appendChild(statusSpan);
      row.appendChild(tdStatus);

      // Column 8: Fee
      const tdFee = document.createElement("td");
      tdFee.textContent = `₹ ${s.parcel.fee.toFixed(2)}`;
      row.appendChild(tdFee);

      tbody.appendChild(row);
    }

    // Foot Summary Row 1: Shipment Counts
    const footRow1 = document.createElement("tr");
    const footSummaryCell1 = document.createElement("th");
    footSummaryCell1.colSpan = 5;
    footSummaryCell1.textContent = `Total Displayed: ${displayList.length} Parcels (${deliveredCount} Delivered, ${displayList.length - deliveredCount} Active)`;
    
    const footSummaryCell2 = document.createElement("th");
    footSummaryCell2.colSpan = 2;
    footSummaryCell2.style.textAlign = "right";
    footSummaryCell2.textContent = "Grand Total Amount:";

    const footSummaryCell3 = document.createElement("th");
    footSummaryCell3.textContent = `₹ ${totalRevenue.toFixed(2)}`;

    footRow1.appendChild(footSummaryCell1);
    footRow1.appendChild(footSummaryCell2);
    footRow1.appendChild(footSummaryCell3);
    tfoot.appendChild(footRow1);
  }
};

// Helper: Pill CSS Class for Status
const getStatusPillClass = (status) => {
  switch (status) {
    case "Order Booked": return "status-pill status-booked";
    case "Picked Up": return "status-pill status-picked";
    case "In Transit": return "status-pill status-transit";
    case "Out for Delivery": return "status-pill status-out";
    case "Delivered": return "status-pill status-delivered";
    default: return "status-pill";
  }
};

// Utility: Format Date and Time
const formatCurrentDateTime = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour is 12

  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
};

// =============================================================================
// APPLICATION INITIALIZATION (DOM Content Loaded)
// =============================================================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing SwiftDrop Logistics Application...");
  
  // Seed sample records
  seedInitialData();

  // Set default pickup date to today
  const pickupDateInput = document.getElementById("pickup-date");
  if (pickupDateInput) {
    const today = new Date().toISOString().split("T")[0];
    pickupDateInput.value = today;
    pickupDateInput.min = today;
  }

  // --- Attach Part 1 Listeners (Abhay Koundal) ---
  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", handleBookingSubmission);
  }

  const liveInputs = ["parcel-weight", "parcel-category", "is-fragile", "cust-type"];
  liveInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", updateLivePricePreview);
      el.addEventListener("change", updateLivePricePreview);
    }
  });

  // Initial price estimation calculation
  updateLivePricePreview();

  // --- Attach Part 2 Listeners (Harshit Choudhary) ---
  const btnAssign = document.getElementById("btn-assign-driver");
  if (btnAssign) {
    btnAssign.addEventListener("click", handleDriverAssignment);
  }

  const btnUpdateStatus = document.getElementById("btn-update-status");
  if (btnUpdateStatus) {
    btnUpdateStatus.addEventListener("click", handleStatusUpdate);
  }

  // Populate Dropdown for Part 2
  populateShipmentSelectorDropdown();

  // --- Attach Part 3 Listeners (Anant Dwivedi) ---
  const btnTrack = document.getElementById("btn-track-shipment");
  if (btnTrack) {
    btnTrack.addEventListener("click", handleTrackingLookup);
  }

  const btnConfirm = document.getElementById("btn-confirm-delivery");
  if (btnConfirm) {
    btnConfirm.addEventListener("click", handleDeliveryConfirmation);
  }

  const filterSelect = document.getElementById("history-filter");
  if (filterSelect) {
    filterSelect.addEventListener("change", (e) => {
      renderShipmentHistoryTable(e.target.value);
    });
  }

  const btnRefresh = document.getElementById("btn-refresh-history");
  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      const currentFilter = document.getElementById("history-filter").value;
      renderShipmentHistoryTable(currentFilter);
    });
  }

  // Render initial history table
  renderShipmentHistoryTable("ALL");

  // Load first shipment into the tracking preview automatically
  if (shipments.length > 0) {
    renderTrackingView(shipments[0]);
    displayGeneratedShipmentId(shipments[0].id);
  }

  console.log("SwiftDrop Logistics Application successfully loaded. Zero <div> elements present.");
});
