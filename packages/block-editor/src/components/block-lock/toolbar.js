/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { useReducer, useRef, useEffect } from '@wordpress/element';
import { lock, unlock } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import BlockLockModal from './modal';
import useBlockLock from './use-block-lock';

export default function BlockLockToolbar( { clientId } ) {
	const { canLock, isLocked } = useBlockLock( clientId );

	const [ isModalOpen, toggleModal ] = useReducer(
		( isActive ) => ! isActive,
		false
	);

	const hasLockButtonShown = useRef( false );

	// If the block lock button has been shown, we don't want to remove it
	// from the toolbar until the toolbar is rendered again without it.
	// Removing it beforehand can cause focus loss issues, such as when
	// unlocking the block from the modal. It needs to return focus from
	// whence it came, and to do that, we need to leave the button in the toolbar.
	useEffect( () => {
		if ( isLocked ) {
			hasLockButtonShown.current = true;
		}
	}, [ isLocked ] );

	if ( ! canLock || ( ! isLocked && ! hasLockButtonShown.current ) ) {
		return null;
	}

	return (
		<>
			<ToolbarGroup className="block-editor-block-lock-toolbar">
				<ToolbarButton
					icon={ isLocked ? lock : unlock }
					label={ isLocked ? __( 'Unlock' ) : __( 'Lock' ) }
					onClick={ toggleModal }
					aria-expanded={ isModalOpen }
					aria-haspopup="dialog"
				/>
			</ToolbarGroup>
			{ isModalOpen && (
				<BlockLockModal clientId={ clientId } onClose={ toggleModal } />
			) }
		</>
	);
}
