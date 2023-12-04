import { makeObservable, observable, action } from 'mobx';

interface FloorTimeData {
  floor: number;
  time: string;
}

type StatusType = 'error' | 'success';
type ModalContentType = 'results' | 'settings';

class GlobalStore {
  fileSelected = { txt: false, xlsx: false };
  datesMatch = true;
  fileReady = false;
  parsedEvents: string[] = [];
  processedData: string[] = [];
  isModalVisible = false;
  nonMatchingData: FloorTimeData[] = [];
  txtDate = '';
  xlsxDate = '';
  statusMessage = '';
  statusType: StatusType = 'success';
  statusTimeoutId: number | null = null;
  selectedFloor: number | null = null;
  fontsLoaded = false;
  modalContent: ModalContentType = 'results';
  timePeriodSec = 60;

  constructor() {
    makeObservable(this, {
      fileSelected: observable,
      datesMatch: observable,
      fileReady: observable,
      parsedEvents: observable,
      processedData: observable,
      isModalVisible: observable,
      nonMatchingData: observable,
      txtDate: observable,
      xlsxDate: observable,
      statusMessage: observable,
      statusType: observable,
      statusTimeoutId: observable,
      selectedFloor: observable,
      fontsLoaded: observable,
      modalContent: observable,
      timePeriodSec: observable,
      
      setFileSelected: action,
      setDatesMatch: action,
      setFileReady: action,
      setParsedEvents: action,
      setProcessedData: action,
      setIsModalVisible: action,
      setNonMatchingData: action,
      setTxtDate: action,
      setXlsxDate: action,
      setStatusMessage: action,
      setStatusType: action,
      setStatusTimeoutId: action,
      setSelectedFloor: action,
      setFontsLoaded: action,
      setModalContent: action,
      setTimePeriodSec: action,
    });
  }

  setFileSelected(value: { txt: boolean, xlsx: boolean }) {
    this.fileSelected = value;
  }

  setDatesMatch(value: boolean) {
    this.datesMatch = value;
  }

  setFileReady(value: boolean) {
    this.fileReady = value;
  }

  setParsedEvents(value: string[]) {
    this.parsedEvents = value;
  }

  setProcessedData(value: string[]) {
    this.processedData = value;
  }

  setIsModalVisible(value: boolean) {
    this.isModalVisible = value;
  }

  setNonMatchingData(value: FloorTimeData[]) {
    this.nonMatchingData = value;
  }

  setTxtDate(value: string) {
    this.txtDate = value;
  }

  setXlsxDate(value: string) {
    this.xlsxDate = value;
  }

  setStatusMessage(value: string) {
    this.statusMessage = value;
  }

  setStatusType(value: StatusType) {
    this.statusType = value;
  }

  setStatusTimeoutId(value: number | null) {
    this.statusTimeoutId = value;
  }

  setSelectedFloor(value: number | null) {
    this.selectedFloor = value;
  }

  setFontsLoaded(value: boolean) {
    this.fontsLoaded = value;
  }

  setModalContent(value: ModalContentType) {
    this.modalContent = value;
  }

  setTimePeriodSec(value: number) {
    this.timePeriodSec = value;
  }
}

export const globalStore = new GlobalStore();
