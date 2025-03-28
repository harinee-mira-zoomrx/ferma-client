export default function downloadFileUsingBlob(blob, fileName) {
    const hiddenElement = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    hiddenElement.href = url;
    hiddenElement.target = '_blank';
    hiddenElement.download = fileName;
    hiddenElement.click();
	window.URL.revokeObjectURL(url);
}