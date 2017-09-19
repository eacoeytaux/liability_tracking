/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 var namespace = 'org.acme.supplychain'

var workflow = "{\"version\":1,\"steps\":[{\"docs\":[{\"name\":\"OrderRequest\",\"reqs\":[\"E\"]}]},{\"docs\":[{\"name\":\"ShipwithS\",\"reqs\":[\"S\"]}],\"newOwner\":\"S\"},{\"docs\":[{\"name\":\"ApprovewithCustoms\",\"reqs\":[\"C1\",\"C2\"]}]},{\"docs\":[{\"name\":\"DelivertoI\",\"reqs\":[\"C3\",\"I\"]}],\"newOwner\":\"I\"}]}"

var ids = {}
function generateID(type) {
	if (ids.type) {
		ids.type += 1;
	} else {
		ids.type = 0;
	}

	return ids.type;
}

function addExchangeToRegistry(exchangeStr) {
	var factory = getFactory();

	console.log('~', exchangeStr);

	var exchangeJSON = JSON.parse(exchangeStr);
	console.log('~ Exchange JSON:', exchangeJSON);

	if (exchangeJSON.steps) {
		for (var i = 0; i < exchangeJSON.steps.length; i++) {
			var stepJSON = exchangeJSON.steps[i];
			console.log('~ step:', exchangeJSON.steps[i]);

			if (stepJSON.docs) {
				//create step asset
				var stepID = generateID('Step');
				var step = factory.newResource(namespace, 'Step', stepID);
				
				//if new owner exists set it in asset
				if (stepJSON.newOwner) {
					step.newOwner = stepJSON.newOwner;
				}

				//populate docReqs in asset
				for (var i = 0; i < step.docs[i]; i++) {
					var docReqJSON = stepJSON.docs[i];
					console.log('~ docs:', docReqJSON);
				}
			}
		}
	} else {
		console.log('~ Invalid exchange proposal JSON');
	}
}

/**
 * Propose a new Exchange
 * @param {org.acme.supplychain.ProposeExchange} exchange - the proposal of an exchange
 * @transaction
 */
function proposeExchange(exchange) {
	var proposer = getCurrentParticipant();
  	console.log('~ proposer:', proposer);

	//error checking
	if (proposer != exchange.exporter) {
		console.log('~ Only the exporter can propose an exchange');
		//TODO error
	}

	if (exchange.exporter == exchange.importer) {
		console.log('~ An exporter cannot export to itself');
		//TODO error
	}

	//end error checking

	addExchangeToRegistry(exchange.exchangeJSON);

	// var factory = getFactory();
    // var NS_M = 'org.acme.vehicle.lifecycle.manufacturer';
    // var NS = 'org.acme.vehicle.lifecycle';
    // var NS_D = 'org.vda';

    // var order = factory.newResource(NS_M, 'Order', placeOrder.orderId);
    // order.vehicleDetails = placeOrder.vehicleDetails;
    // order.orderStatus = 'PLACED';
    // order.manufacturer = placeOrder.manufacturer;
    // order.orderer = factory.newRelationship(NS, 'PrivateOwner', placeOrder.orderer.getIdentifier());

    // // save the order
    // return getAssetRegistry(order.getFullyQualifiedType())
    //     .then(function (registry) {
    //         return registry.add(order);
    //     })
    //     .then(function(){
    // 		var placeOrderEvent = factory.newEvent(NS_M, 'PlaceOrderEvent');
    //   		placeOrderEvent.orderId = order.orderId;
    //   		placeOrderEvent.vehicleDetails = order.vehicleDetails;
    // 		emit(placeOrderEvent);
    // 	});
}

/**
 * Approve an Exchange
 * @param {org.acme.supplychain.ApproveExchange} exchange - the approval of an exchange
 * @transaction
 */
function approveExchange(exchange) {
	var approver = getCurrentParticipant();
	console.log('~ approver:', approver);

	if (approver != exchange.importer) {
		//TODO error "approver is not required approver"
	}
	

	console.log('~ yayyy');
}

/**
 * Accept a form as complete
 * @param {org.acme.supplychain.ApproveDoc} approval - the docs to be approved
 * @transaction
 */
function approveDocument(approval) {
	var approver = getCurrentParticipant();
	
	var approverIndex = -1
	for (var i = 0; i < approval.docReq.requiredApprovers; i++) {
		if (approver == approval.docReq.requiredApprovers[i]) {
			approverIndex = i;
			break;
		}
	}

	if (approverIndex == -1) {
		//TODO error "approver is not required on this document"
	}

	approval.docReq.signatures[approverIndex] = approval.signature
}

/**
 * Move liability of a resource to a new company
 * @param {org.acme.supplychain.TransferLiability} transfer - the liability of the resource to be processed
 * @transaction
 */
function takeLiability(transfer) {
	transfer.resourceLiability.owner = trade.newOwner;
	return getAssetRegistry('org.acme.supplychain.ResourceLiability')
	.then(function (assetRegistry) {
		return assetRegistry.update(transfer.resourceLiability);
	});
}
