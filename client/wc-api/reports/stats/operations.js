/** @format */
/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * WooCommerce dependencies
 */
import { stringifyQuery } from '@woocommerce/navigation';

/**
 * Internal dependencies
 */
import { getResourceIdentifier, getResourcePrefix } from 'wc-api/utils';
import { NAMESPACE } from 'wc-api/constants';

const statEndpoints = [
	'coupons',
	'downloads',
	'orders',
	'products',
	'revenue',
	'stock',
	'taxes',
	'customers',
];

const typeEndpointMap = {
	'report-stats-query-orders': 'orders',
	'report-stats-query-revenue': 'revenue',
	'report-stats-query-products': 'products',
	'report-stats-query-categories': 'categories',
	'report-stats-query-downloads': 'downloads',
	'report-stats-query-coupons': 'coupons',
	'report-stats-query-stock': 'stock',
	'report-stats-query-taxes': 'taxes',
	'report-stats-query-customers': 'customers',
};

function read( resourceNames, fetch = apiFetch ) {
	const filteredNames = resourceNames.filter( name => {
		const prefix = getResourcePrefix( name );
		return Boolean( typeEndpointMap[ prefix ] );
	} );

	return filteredNames.map( async resourceName => {
		const prefix = getResourcePrefix( resourceName );
		const endpoint = typeEndpointMap[ prefix ];
		const query = getResourceIdentifier( resourceName );

		const fetchArgs = {
			parse: false,
		};

		if ( statEndpoints.indexOf( endpoint ) >= 0 ) {
			fetchArgs.path = NAMESPACE + '/reports/' + endpoint + '/stats' + stringifyQuery( query );
		} else {
			fetchArgs.path = endpoint + stringifyQuery( query );
		}

		try {
			const response = await fetch( fetchArgs );
			const report = await response.json();
			const totalResults = parseInt( response.headers.get( 'x-wp-total' ) );
			const totalPages = parseInt( response.headers.get( 'x-wp-totalpages' ) );

			return {
				[ resourceName ]: {
					data: report,
					totalResults,
					totalPages,
				},
			};
		} catch ( error ) {
			return { [ resourceName ]: { error } };
		}
	} );
}

export default {
	read,
};
