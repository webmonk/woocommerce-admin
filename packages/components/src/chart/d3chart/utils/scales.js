/** @format */

/**
 * External dependencies
 */
import {
	scaleBand as d3ScaleBand,
	scaleLinear as d3ScaleLinear,
	scaleTime as d3ScaleTime,
} from 'd3-scale';
import moment from 'moment';

/**
 * Describes getXScale
 * @param {array} uniqueDates - from `getUniqueDates`
 * @param {number} width - calculated width of the charting space
 * @param {boolean} compact - whether the chart must be compact (without padding
 between days)
 * @returns {function} a D3 scale of the dates
 */
export const getXScale = ( uniqueDates, width, compact = false ) =>
	d3ScaleBand()
		.domain( uniqueDates )
		.range( [ 0, width ] )
		.paddingInner( compact ? 0 : 0.1 );

/**
 * Describes getXGroupScale
 * @param {array} orderedKeys - from `getOrderedKeys`
 * @param {function} xScale - from `getXScale`
 * @param {boolean} compact - whether the chart must be compact (without padding
 between days)
 * @returns {function} a D3 scale for each category within the xScale range
 */
export const getXGroupScale = ( orderedKeys, xScale, compact = false ) =>
	d3ScaleBand()
		.domain( orderedKeys.filter( d => d.visible ).map( d => d.key ) )
		.rangeRound( [ 0, xScale.bandwidth() ] )
		.padding( compact ? 0 : 0.07 );

/**
 * Describes getXLineScale
 * @param {array} uniqueDates - from `getUniqueDates`
 * @param {number} width - calculated width of the charting space
 * @returns {function} a D3 scaletime for each date
 */
export const getXLineScale = ( uniqueDates, width ) =>
	d3ScaleTime()
		.domain( [
			moment( uniqueDates[ 0 ], 'YYYY-MM-DD HH:mm' ).toDate(),
			moment( uniqueDates[ uniqueDates.length - 1 ], 'YYYY-MM-DD HH:mm' ).toDate(),
		] )
		.rangeRound( [ 0, width ] );

const getMaxYValue = data => {
	let maxYValue = Number.NEGATIVE_INFINITY;
	data.map( d => {
		for ( const [ key, item ] of Object.entries( d ) ) {
			if ( key !== 'date' && Number.isFinite( item.value ) && item.value > maxYValue ) {
				maxYValue = item.value;
			}
		}
	} );

	return maxYValue;
};

/**
 * Describes and rounds the maximum y value to the nearest thousand, ten-thousand, million etc. In case it is a decimal number, ceils it.
 * @param {array} data - The chart component's `data` prop.
 * @returns {number} the maximum value in the timeseries multiplied by 4/3
 */
export const getYMax = data => {
	const maxValue = getMaxYValue( data );
	if ( ! Number.isFinite( maxValue ) || maxValue <= 0 ) {
		return 0;
	}
	const yMax = 4 / 3 * maxValue;
	const pow3Y = Math.pow( 10, ( ( Math.log( yMax ) * Math.LOG10E + 1 ) | 0 ) - 2 ) * 3;
	return Math.ceil( Math.ceil( yMax / pow3Y ) * pow3Y );
};

/**
 * Describes getYScale
 * @param {number} height - calculated height of the charting space
 * @param {number} yMax - maximum y value
 * @returns {function} the D3 linear scale from 0 to the value from `getYMax`
 */
export const getYScale = ( height, yMax ) =>
	d3ScaleLinear()
		.domain( [ 0, yMax === 0 ? 1 : yMax ] )
		.rangeRound( [ height, 0 ] );
