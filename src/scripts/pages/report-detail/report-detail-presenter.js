import { reportMapper } from '../../data/api-mapper';

export default class ReportDetailPresenter {
  #reportId;
  #view;
  #apiModel;

  constructor(reportId, { view, apiModel }) {
    this.#reportId = reportId;
    this.#view = view;
    this.#apiModel = apiModel;
  }

  async showReportDetailMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showReportDetailMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showReportDetail() {
    this.#view.showReportDetailLoading();
    try {
      const response = await this.#apiModel.getReportById(this.#reportId);

      if (!response.ok) {
        console.error('showReportDetail: response:', response);
        this.#view.populateReportDetailError(response.message);
        return;
      }

      const report = await reportMapper(response.data);
      console.log(report); // for debugging purpose, remove after checking it

      this.#view.populateReportDetailAndInitialMap(response.message, report);
    } catch (error) {
      console.error('showReportDetail: error:', error);
      this.#view.populateReportDetailError(error.message);
    } finally {
      this.#view.hideReportDetailLoading();
    }
  }

  async getCommentsList() {
    this.#view.showCommentsLoading();
    try {
      const response = await this.#apiModel.getAllCommentsByReportId(this.#reportId);
      this.#view.populateReportDetailComments(response.message, response.data);
    } catch (error) {
      console.error('getCommentsList: error:', error);
      this.#view.populateCommentsListError(error.message);
    } finally {
      this.#view.hideCommentsLoading();
    }
  }

  async postNewComment({ body }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#apiModel.storeNewCommentByReportId(this.#reportId, { body });
 
      if (!response.ok) {
        console.error('postNewComment: response:', response);
        this.#view.postNewCommentFailed(response.message);
        return;
      }
 
      // No need to wait response
      this.notifyReportOwner(response.data.id);
 
      this.#view.postNewCommentSuccessfully(response.message, response.data);
    } catch (error) {
      console.error('postNewComment: error:', error);
      this.#view.postNewCommentFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
 
  async notifyReportOwner(commentId) {
    try {
      const response = await this.#apiModel.sendCommentToReportOwnerViaNotification(
        this.#reportId,
        commentId,
      );
      if (!response.ok) {
        console.error('notifyReportOwner: response:', response);
        return;
      }
      console.log('notifyReportOwner:', response.message);
    } catch (error) {
      console.error('notifyReportOwner: error:', error);
    }
  }
  
  async notifyMe() {
    try {
      const response = await this.#apiModel.sendReportToMeViaNotification(this.#reportId);
      if (!response.ok) {
        console.error('notifyMe: response:', response);
        return;
      }
      console.log('notifyMe:', response.message);
    } catch (error) {
      console.error('notifyMe: error:', error);
    }
  }

  showSaveButton() {
    if (this.#isReportSaved()) {
      this.#view.renderRemoveButton();
      return;
    }

    this.#view.renderSaveButton();
  }

  #isReportSaved() {
    return false;
  }
}
