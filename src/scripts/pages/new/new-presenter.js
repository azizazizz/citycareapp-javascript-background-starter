export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showNewFormMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postNewReport({ title, damageLevel, description, evidenceImages, latitude, longitude }) {
    this.#view.showSubmitLoadingButton();
    try {
      const data = {
        title: title,
        damageLevel: damageLevel,
        description: description,
        evidenceImages: evidenceImages,
        latitude: latitude,
        longitude: longitude,
      };
      const response = await this.#model.storeNewReport(data);

      if (!response.ok) {
        console.error('postNewReport: response:', response);
        this.#view.storeFailed(response.message);
        return;
      }

      // No need to wait response
      this.#notifyToAllUser(response.data.id);
 
      this.#view.storeSuccessfully(response.message, response.data);
    } catch (error) {
      console.error('postNewReport: error:', error);
      this.#view.storeFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
 
  async #notifyToAllUser(reportId) {
    try {
      const response = await this.#model.sendReportToAllUserViaNotification(reportId);
      if (!response.ok) {
        console.error('#notifyToAllUser: response:', response);
        return false;
      }
      return true;
    } catch (error) {
      console.error('#notifyToAllUser: error:', error);
      return false;
    }
  }
}