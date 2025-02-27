/**
 * WordPress dependencies
 */
import {
	Modal,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useDispatch, resolveSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useState } from '@wordpress/element';
import { plus } from '@wordpress/icons';
import { privateApis as routerPrivateApis } from '@wordpress/router';

/**
 * Internal dependencies
 */
import SidebarNavigationItem from '../sidebar-navigation-item';
import DEFAULT_VIEWS from './default-views';
import { unlock } from '../../lock-unlock';

const { useHistory, useLocation } = unlock( routerPrivateApis );

function AddNewItemModalContent( { type, setIsAdding } ) {
	const {
		params: { path },
	} = useLocation();
	const history = useHistory();
	const { saveEntityRecord } = useDispatch( coreStore );
	const [ title, setTitle ] = useState( '' );
	const [ isSaving, setIsSaving ] = useState( false );
	return (
		<form
			onSubmit={ async ( event ) => {
				event.preventDefault();
				setIsSaving( true );
				const { getEntityRecords } = resolveSelect( coreStore );
				let dataViewTaxonomyId;
				const dataViewTypeRecords = await getEntityRecords(
					'taxonomy',
					'wp_dataviews_type',
					{ slug: type }
				);
				if ( dataViewTypeRecords && dataViewTypeRecords.length > 0 ) {
					dataViewTaxonomyId = dataViewTypeRecords[ 0 ].id;
				} else {
					const record = await saveEntityRecord(
						'taxonomy',
						'wp_dataviews_type',
						{ name: type }
					);
					if ( record && record.id ) {
						dataViewTaxonomyId = record.id;
					}
				}
				const savedRecord = await saveEntityRecord(
					'postType',
					'wp_dataviews',
					{
						title,
						status: 'publish',
						wp_dataviews_type: dataViewTaxonomyId,
						content: JSON.stringify(
							DEFAULT_VIEWS[ type ][ 0 ].view
						),
					}
				);
				history.push( {
					path,
					activeView: savedRecord.id,
					isCustom: 'true',
				} );
				setIsSaving( false );
				setIsAdding( false );
			} }
		>
			<VStack spacing="5">
				<TextControl
					__nextHasNoMarginBottom
					label={ __( 'Name' ) }
					value={ title }
					onChange={ setTitle }
					placeholder={ __( 'My view' ) }
					className="patterns-create-modal__name-input"
				/>
				<HStack justify="right">
					<Button
						variant="tertiary"
						onClick={ () => {
							setIsAdding( false );
						} }
					>
						{ __( 'Cancel' ) }
					</Button>

					<Button
						variant="primary"
						type="submit"
						aria-disabled={ ! title || isSaving }
						isBusy={ isSaving }
					>
						{ __( 'Create' ) }
					</Button>
				</HStack>
			</VStack>
		</form>
	);
}

export default function AddNewItem( { type } ) {
	const [ isAdding, setIsAdding ] = useState( false );
	return (
		<>
			<SidebarNavigationItem
				icon={ plus }
				onClick={ () => {
					setIsAdding( true );
				} }
				className="dataviews__siderbar-content-add-new-item"
			>
				{ __( 'New view' ) }
			</SidebarNavigationItem>
			{ isAdding && (
				<Modal
					title={ __( 'Add new view' ) }
					onRequestClose={ () => {
						setIsAdding( false );
					} }
				>
					<AddNewItemModalContent
						type={ type }
						setIsAdding={ setIsAdding }
					/>
				</Modal>
			) }
		</>
	);
}
