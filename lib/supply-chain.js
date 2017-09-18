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

var workflow = {
    "version": 1,
	"steps": [
		{
			"docs": [
				{
					"name": "Order Request",
					"reqs": [
						"E"
					]
				}
			]
		},
		{
			"docs": [
				{
					"name": "Ship with S",
					"reqs": [
						"S"
					]
				}
			],
			"newOwner": "S"
		},
		{
			"docs": [
				{
					"name": "Approve with Customs",
					"reqs": [
						"C1",
						"C2"
					]
				}
			]
		},
		{
			"docs": [
				{
					"name": "Deliver to I",
					"reqs": [
						"C3",
						"I"
					]
				}
			],
			"newOwner": "I"
		}
	]
}


/**
 * Accept a form as complete
 * @param {org.acme.supplychain.ApproveDoc} approval - the docs to be approved
 * @transaction
 */
function approveDocument(approval) {
	var signer = getCurrentParticipant();
	
	var approverIndex = -1
	for (var i = 0; i < approval.docReq.requiredApprovers; i++) {
		if (approval.docReq.requiredApprovers[i] == i) {
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
