import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

Modal.setAppElement('body');

class ConfirmModal extends React.Component {
  constructor(props) {
    super(props)
    this.shouldCloseOnOverlayClick = true
    this.contentLabel = 'Modal'
    this.contentClass = {
      base: 'modal-content',
      afterOpen: 'after-open',
      beforeClose: 'before-close',

    }
    this.overlayClass = {
      base: 'vive-modal',
      afterOpen: 'after-open',
      beforeClose: 'before-close',

    }
    this.state = {
      modalIsOpen: false,
    }

    this.confirm = this.confirm.bind(this);
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
  }

  confirm() {
    this.close();
    this.props.confirm();
  }

  close() {
    this.setState({ modalIsOpen: false });
  }

  open() {
    this.setState({ modalIsOpen: true });    
  }

  render() {
    const {
      title,
      childComponent,
      showFooter,
    } = this.props;

    const {
      modalIsOpen,
    } = this.state;

    const {
      shouldCloseOnOverlayClick,
      contentLabel,
      contentClass,
      overlayClass,
      confirm,
      close,
    } = this;

    return (
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={close}
        shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
        contentLabel={contentLabel}
        className={contentClass}
        overlayClassName={overlayClass}
      >
        <div className="panel panel-default">
          {
            title && (
              <div className="panel-heading">
                <div className="d-flex">
                  <div className="col">{title}</div>
                  <button className="btn btn-close" onClick={close}>
                    <i className="icon-font icon-f-close"></i>
                  </button>
                </div>
              </div>
            )
          }
          <div className="panel-body">
            {childComponent}
          </div>
          {
            showFooter && (
              <div className="panel-footer">
                <div className="d-flex justify-content-around">
                  <button className="btn btn-cancel" onClick={close}>取消</button>
                  <button className="btn btn-confirm" onClick={confirm}>確定</button>
                </div>
              </div>
            )
          }
        </div>
      </Modal>
    )
  }
}

export default ConfirmModal;